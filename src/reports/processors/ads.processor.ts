import { Job, DoneCallback } from 'bull';
import { PrismaClient as PrismaVendoCommerce } from '../../../prisma/commerce/generated/vendoCommerce';
import * as process from 'process';
import { SpReportsService } from '../sp.reports.service';
import { AdsReportsService } from '../ads.reports.service';
import { AdsCronService } from '../ads.cron.service';

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
  const adsCron = new AdsCronService(adsSvc, vendoCommerce, spSvc);
  try {
    await vendoCommerce.$connect();
    const brand = await vendoCommerce.brands.findUniqueOrThrow({
      where: {
        id: job.data.brandId,
      },
    });
    await adsCron.requestReportsForSingleBrand(brand, job);
    await adsCron.checkReportsForSingleBrand(brand, job);
    cb(null, { brandId: job.data.brandId, isSuccess: true });
  } catch (e) {
    cb(e, { brandId: job.data.brandId, isSuccess: false });
  } finally {
    await vendoCommerce.$disconnect();
  }
}
