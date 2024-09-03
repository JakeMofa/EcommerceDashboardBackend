import { PrismaClient as PrismaVendoBrand } from '../../../prisma/brand/generated/vendoBrand';
import { Logger } from '@nestjs/common';
import { Brands, PrismaClient as PrismaVendoCommerce } from '../../../prisma/commerce/generated/vendoCommerce';

export interface ReportRes {
  reportId: string;
  processingStatus: 'CANCELLED' | 'IN_PROGRESS' | 'IN_QUEUE' | 'DONE' | 'FATAL' | 'FAILURE' | 'SUCCESS';
  marketPlaceIds?: string[];
  reportType: string;
  dataStartTime?: string;
  dataEndTime?: string;
  reportDocumentId?: string;
  reportScheduleId?: string;
  processingStartTime?: string;
  processingEndTime?: string;
  createdTime?: string;
}
enum CentralLogStatusEnum {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
export class ReportLogsUtils {
  constructor(
    private readonly client: PrismaVendoBrand,
    private readonly brandId: number,
    private readonly commerce: PrismaVendoCommerce,
  ) {}

  async createRequestedReportLog(
    reportId: string,
    marketPlaceName: string,
    marketPlaceId: string,
    startDate: string,
    endDate: string,
    reportType: string,
  ) {
    this.commerce.central_report_log.create({
      data: {
        brand_id: this.brandId,
        report_id: reportId,
        updated_at: new Date(),
        data_start_time: startDate,
        data_end_time: endDate,
        created_at: new Date(),
        status: CentralLogStatusEnum.IN_PROGRESS,
        report_type: reportType,
      },
    });
    return this.client.report_log.create({
      data: {
        report_id: reportId,
        processing_status: '',
        updated_at: Date.now(),
        data_start_time: startDate,
        data_end_time: endDate,
        created_at: Date.now(),
        marketplace_id: marketPlaceId,
        status: 0,
        marketplace: marketPlaceName,
        report_type: reportType,
      },
    });
  }

  async updateRequestedReportLog(report: ReportRes) {
    const reportLog = await this.client.report_log.findFirst({
      where: {
        report_id: report.reportId,
      },
    });
    if (!reportLog) return undefined;
    reportLog.report_document_id = report.reportDocumentId ?? null;
    reportLog.report_schedule_id = report.reportScheduleId ? Number(report.reportScheduleId) : null;
    reportLog.processing_status = report.processingStatus;
    reportLog.report_current_status = report.processingStatus;
    reportLog.data_start_time = report.dataStartTime ?? null;
    reportLog.data_end_time = report.dataEndTime ?? null;
    reportLog.processing_start_time = report.processingStartTime ?? null;
    reportLog.processing_end_time = report.processingEndTime ?? null;
    reportLog.created_time = report.createdTime ?? null;
    reportLog.status =
      report.processingStatus === 'CANCELLED' ||
      report.processingStatus === 'FATAL' ||
      report.processingStatus === 'DONE' ||
      report.processingStatus === 'SUCCESS' ||
      (report.processingStatus as any) === 'COMPLETED' ||
      report.processingStatus === 'FAILURE'
        ? 1
        : 0;
    reportLog.updated_at = Date.now() as unknown as bigint;
    reportLog.report_request_status =
      report.processingStatus === 'CANCELLED'
        ? 3
        : report.processingStatus === 'DONE' ||
          report.processingStatus === 'SUCCESS' ||
          (report.processingStatus as any) === 'COMPLETED'
        ? 2
        : report.processingStatus === 'FAILURE' || report.processingStatus === 'FATAL'
        ? 1
        : 0;
    reportLog.updated_at = BigInt(Date.now());
    await this.client.report_log.update({
      where: {
        id: reportLog.id,
      },
      data: reportLog,
    });
    return reportLog;
  }

  async markReportAsDone(reportId: bigint) {
    return this.client.report_log.update({
      where: {
        id: reportId,
      },
      data: {
        report_request_status: 4,
        updated_at: BigInt(Date.now()),
      },
    });
  }

  async markReportAsError(reportId: bigint) {
    return this.client.report_log.update({
      where: {
        id: reportId,
      },
      data: {
        report_request_status: 5,
        updated_at: BigInt(Date.now()),
      },
    });
  }

  async getPendingReports(reportTypes: string[]) {
    const reports = await this.client.report_log.findMany({
      where: {
        OR: [
          {
            status: 0,
          },
          {
            status: 1,
            report_request_status: 2,
          },
        ],
        report_type: {
          in: reportTypes,
        },
      },
    });
    return [
      ...reports.filter((r) => r.report_type === 'GET_MERCHANT_LISTINGS_ALL_DATA'),
      ...reports.filter((r) => r.report_type !== 'GET_MERCHANT_LISTINGS_ALL_DATA'),
    ];
  }

  static async fallback<T>(cb: () => Promise<T>, logger?: Logger, brandName: string | null = null) {
    let tries = 0;
    while (true) {
      tries += 1;
      try {
        await this.sleep(tries * 3000);
        return await cb();
      } catch (e) {
        if (tries < 5) {
          logger?.warn(`Waiting ${10 * tries}s`);
          if (brandName) {
            logger?.warn(`Error on brand ${brandName}`);
          }
          logger?.error(e);
          await this.sleep(10000 * tries);
        } else {
          throw e;
        }
      }
    }
  }

  static sleep(ms: number) {
    return new Promise<void>((res) => {
      setTimeout(() => res(), ms);
    });
  }

  static async brandDbProvider<T>(brand: Brands, cb: (client: PrismaVendoBrand) => Promise<T>) {
    let client: PrismaVendoBrand | null = null;
    try {
      client = new PrismaVendoBrand({
        datasources: {
          db: {
            url: process.env.DATABASE_URL + (brand.db_name ?? ''),
          },
        },
      });
      await client.$connect();
      return cb(client);
    } finally {
      await client?.$disconnect();
    }
  }

  static async reportResultPerBrand(client: PrismaVendoBrand) {
    const result: { [key: string]: { done: number; inProgress: number; failed: number } } = {};
    const reports = await client.report_log.findMany();
    for (const report of reports) {
      const reportType = report.report_type ?? '';
      if (!result[reportType]) {
        result[reportType] = {
          done: 0,
          failed: 0,
          inProgress: 0,
        };
      }
      if (report.status === 0 || (report.status === 1 && report.report_request_status === 2)) {
        result[reportType].inProgress += 1;
        continue;
      }
      if (report.status === 1 && report.report_request_status === 4) {
        result[reportType].done += 1;
        continue;
      }
      if (report.status === 1 && (report.report_request_status === 3 || report.report_request_status === 5)) {
        result[reportType].failed += 1;
      }
    }
    return Object.keys(result).map((k) => ({
      type: k,
      status: `done: ${result[k].done} - in progress: ${result[k].inProgress} - failed: ${result[k].failed}`,
    }));
  }
}
