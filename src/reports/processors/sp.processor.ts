import { Job, DoneCallback } from 'bull';
import { PrismaClient as PrismaVendoCommerce } from '../../../prisma/commerce/generated/vendoCommerce';
import * as process from 'process';
import { SpReportsService } from '../sp.reports.service';
import { AdsReportsService } from '../ads.reports.service';
import { SpCronService } from '../sp.cron.service';

export default async function (job: Job<{ brandId: number }>, cb: DoneCallback) {
  const vendoCommerce = new PrismaVendoCommerce({
    datasources: {
      db: {
        url: process.env.DATABASE_VENDO_COMMERCE_URL,
      },
    },
  });
  const spSvc = new SpReportsService(vendoCommerce);
  const adsSvc = new AdsReportsService();
  const spCron = new SpCronService(spSvc, adsSvc, vendoCommerce);
  try {
    await vendoCommerce.$connect();
    const brand = await vendoCommerce.brands.findUniqueOrThrow({
      where: {
        id: job.data.brandId,
      },
    });
    await spCron.requestReportsForSingleBrand(brand, job);
    await spCron.checkReportForSingleBrand(brand, job);
    cb(null, { brandId: job.data.brandId, isSuccess: true });
  } catch (e) {
    cb(e, { brandId: job.data.brandId, isSuccess: false });
  } finally {
    await vendoCommerce.$disconnect();
  }
}
