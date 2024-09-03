import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as process from 'process';
import { Brand_status, Brands } from '../../prisma/commerce/generated/vendoCommerce';
import { VendoCommerceDBService } from '../prisma.service';
import { ReportLogsUtils } from './utils/reportLogs.utils';
import { PrismaClient as PrismaVendoBrand } from '../../prisma/brand/generated/vendoBrand';
import { ReportDateUtils } from './utils/reportDate.utils';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SpReportsService } from './sp.reports.service';
import { AdsReportsService } from './ads.reports.service';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly commerceDb: VendoCommerceDBService,
    @InjectQueue('sp') private readonly spQueue: Queue,
    @InjectQueue('ads') private readonly adsQueue: Queue,
  ) {}

  async onModuleInit() {
    if (process.env['WITH_CRON'] !== '1') {
      this.logger.warn(`With cron not set. Skipping Cron Jobs`);
      return;
    }
    this.runCron().then();
  }

  async getConnectedBrands(allBrands = false) {
    const query = {
      AND: [
        {
          db_name: {
            not: null,
          },
        },
        {
          db_name: {
            not: '',
          },
        },
      ],
    };
    if (!allBrands) {
      query['AND']['status'] = Brand_status.Created;
    }
    return this.commerceDb.brands.findMany({
      where: query,
    });
  }

  private async runCron() {
    while (1) {
      try {
        const brands = await this.getConnectedBrands();
        for (const brand of brands) {
          const spSvc = new SpReportsService(this.commerceDb);
          const adsSvc = new AdsReportsService();
          const creds = await ReportLogsUtils.brandDbProvider(brand, async (client) => {
            const adsCreds = await adsSvc.getAdsCredentials(client);
            const spCreds = await spSvc.getSpCredentials(client);
            return { adsCreds, spCreds };
          });
          if (creds.spCreds) {
            await this.addSpJob(brand.id);
          }
          if (adsSvc.exportAdsCredential(creds.adsCreds, creds.spCreds?.marketPlaceId ?? '')) {
            await this.addAdsJob(brand.id);
          }
        }
        await this.sleep(60);
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  private async addSpJob(brandId: number) {
    const jobs = await this.spQueue.getJobs(['waiting', 'active'], 0, -1, false);
    if (!jobs.find((j) => j.data.brandId === brandId)) {
      await this.spQueue.add({ brandId: brandId });
    }
  }

  private async addAdsJob(brandId: number) {
    const jobs = await this.adsQueue.getJobs(['waiting', 'active'], 0, -1, false);
    if (!jobs.find((j) => j.data.brandId === brandId)) {
      await this.adsQueue.add({ brandId: brandId });
    }
  }

  private async sleep(minutes: number) {
    return new Promise<void>((res) => {
      setTimeout(() => res(), minutes * 60 * 1000);
    });
  }

  async getReportResults() {
    const result: Record<string, string>[] = [];
    await this.doSomethingForEveryBrandInParallel(async (client, brand) => {
      const reportRes = await ReportLogsUtils.reportResultPerBrand(client);
      result.push({
        brandName: brand.name,
        ...reportRes.reduce(
          (previousValue, currentValue) => ({
            ...previousValue,
            [currentValue.type]: currentValue.status,
          }),
          {},
        ),
      });
    }, 200);
    console.log('reports are fetched');
    return result;
  }

  async doSomethingForEveryBrand<T>(cb: (client: PrismaVendoBrand, brand: Brands) => Promise<T>) {
    const brands = await this.getConnectedBrands();
    const result: T[] = [];
    for (const brand of brands) {
      console.log(brand.name, 'started');
      try {
        await ReportLogsUtils.brandDbProvider(brand, async (client) => {
          const res = await cb(client, brand);
          result.push(res);
        });
        console.log(brand.name, 'done');
      } catch (e) {
        console.log(e);
      }
    }
    return result;
  }

  async doSomethingForEveryBrandInParallel<T>(
    cb: (client: PrismaVendoBrand, brand: Brands) => Promise<T>,
    timeout = 5000,
    log = true,
    allBrands = false,
  ) {
    const brands = await this.getConnectedBrands(allBrands);
    const result: Promise<T | undefined>[] = [];
    for (const brand of brands) {
      await ReportLogsUtils.sleep(timeout);
      result.push(
        new Promise<T | undefined>(async (resolve) => {
          if (log) {
            console.log(brand.name, 'started');
          }
          try {
            await ReportLogsUtils.brandDbProvider(brand, async (client) => {
              const res = await cb(client, brand);
              if (log) {
                console.log(brand.name, 'done');
              }
              resolve(res);
            });
          } catch (e) {
            console.log(e);
            resolve(undefined);
          }
        }),
      );
    }
    return await Promise.all(result);
  }

  async computeMissingDates(client: PrismaVendoBrand) {
    const missingDates = (await client.$queryRawUnsafe(`
      WITH RECURSIVE dates AS (
        SELECT '2022-01-01' AS dt
        UNION ALL
        SELECT DATE_ADD(dt, INTERVAL 1 DAY)
        FROM dates
        WHERE dt < Date(current_date() - 1)
      )
      
      SELECT dates.dt AS missing_date
      FROM dates
      LEFT JOIN (
        SELECT DATE(shipment_date) AS s_date
        FROM get_amazon_fulfilled_shipments_data_general
        WHERE shipment_date BETWEEN '2022-01-01' AND Date(current_date() - 1)
        GROUP BY DATE(shipment_date)
      ) AS a ON dates.dt = a.s_date
      WHERE a.s_date IS NULL
      ORDER BY dates.dt ASC;
    `)) as { missing_date: string }[];
    const result: { from: Date; to: Date }[] = [];
    let lastDate: { from: Date; to: Date } | null = null;
    for (const missingDate of missingDates) {
      if (lastDate == null) {
        lastDate = { from: new Date(missingDate.missing_date), to: new Date(missingDate.missing_date) };
        continue;
      }
      const currentDate = new Date(missingDate.missing_date);
      if (new ReportDateUtils(lastDate.to).getDays(currentDate) <= 1) {
        lastDate.to = currentDate;
        continue;
      }
      result.push(lastDate);
      lastDate = { from: currentDate, to: currentDate };
    }
    if (lastDate) {
      result.push(lastDate);
    }
    return result;
  }
}
