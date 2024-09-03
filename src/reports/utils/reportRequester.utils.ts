import { PrismaClient as PrismaVendoBrand, user_credentials } from '../../../prisma/brand/generated/vendoBrand';
import { ReportDateUtils } from './reportDate.utils';
import { SpReportsService } from '../sp.reports.service';
import { AdsReportsService } from '../ads.reports.service';
import { ReportLogsUtils } from './reportLogs.utils';
import { PrismaClient as PrismaVendoCommerce } from '../../../prisma/commerce/generated/vendoCommerce';

export type reportType =
  | 'GET_MERCHANT_LISTINGS_ALL_DATA'
  | 'GET_SALES_AND_TRAFFIC_REPORT'
  | 'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL'
  | 'AdsProductReport'
  | 'CampaignBrandReport'
  | 'CampaignDisplayReport'
  | 'CampaignDisplayReportT30'
  | 'CampaignDisplayReportT20';

export class ReportRequesterUtils {
  constructor(
    private readonly reportType: reportType,
    private readonly client: PrismaVendoBrand,
    private readonly commerce: PrismaVendoCommerce,

    private readonly spReportService: SpReportsService,
    private readonly adsReportService: AdsReportsService,
    private readonly brandName: string,
    private readonly brandId: number,
    private readonly period?: { startDate: Date; endDate: Date },
  ) {}

  async request() {
    switch (this.reportType) {
      case 'GET_MERCHANT_LISTINGS_ALL_DATA':
        await this.requestProductReport();
        break;
      case 'GET_SALES_AND_TRAFFIC_REPORT':
        await this.requestSalesAndTrafficReport();
        break;
      case 'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL':
        await this.requestShipmentReport();
        break;
      case 'AdsProductReport':
        await this.requestAdsProductReport();
        break;
      case 'CampaignBrandReport':
        await this.requestCampaignBrandReport();
        break;
      case 'CampaignDisplayReportT30':
        await this.requestCampaignDisplayReport('t30');
        break;
      case 'CampaignDisplayReportT20':
        await this.requestCampaignDisplayReport('t20');
        break;
      default:
        throw new Error('Report type not recognized!');
    }
  }

  private async requestSalesAndTrafficReport() {
    const period = await this.calculateReportPeriod(-365 * 2 + 7);
    if (period.from.getTime() >= new ReportDateUtils(new Date()).date.getTime()) {
      return;
    }
    period.from = new ReportDateUtils(period.from).addDays(-30);
    const separatedDays = ReportDateUtils.splitDate(
      new ReportDateUtils(period.from),
      new ReportDateUtils(period.to),
      0,
    );
    const credentials = await this.getSpCredentials();
    const client = await this.spReportService.getSpApiClient(credentials, this.brandName);
    for (const date of separatedDays) {
      const reportId = await this.spReportService.requestReport(
        this.brandName,
        credentials,
        'GET_SALES_AND_TRAFFIC_REPORT',
        client,
        date.from.date,
        date.to.date,
      );
      if (!reportId) continue;
      await new ReportLogsUtils(this.client, this.brandId, this.commerce).createRequestedReportLog(
        reportId,
        credentials.marketPlaceName,
        credentials.marketPlaceId,
        date.from.date.toISOString(),
        date.to.date.toISOString(),
        'GET_SALES_AND_TRAFFIC_REPORT',
      );
    }
  }

  private async requestShipmentReport() {
    const period = await this.calculateReportPeriod(-356 * 2);
    if (period.from.getTime() >= new ReportDateUtils(new Date()).date.getTime()) {
      return;
    }
    period.from = new ReportDateUtils(period.from).addDays(-7);
    const separatedDays = ReportDateUtils.splitDate(
      new ReportDateUtils(period.from),
      new ReportDateUtils(period.to),
      7,
    );
    const credentials = await this.getSpCredentials();
    const client = await this.spReportService.getSpApiClient(credentials, this.brandName);
    for (const date of separatedDays) {
      const reportId = await this.spReportService.requestReport(
        this.brandName,
        credentials,
        'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL',
        client,
        date.from.date,
        new ReportDateUtils(date.to.date).addDays(1),
      );
      if (!reportId) continue;
      await new ReportLogsUtils(this.client, this.brandId, this.commerce).createRequestedReportLog(
        reportId,
        credentials.marketPlaceName,
        credentials.marketPlaceId,
        date.from.date.toISOString(),
        date.to.date.toISOString(),
        'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL',
      );
    }
  }

  private async requestProductReport() {
    const period = await this.calculateReportPeriod(-365 * 2);
    if (period.from.getTime() >= new ReportDateUtils(new Date()).date.getTime()) {
      return;
    }
    const separatedDays = ReportDateUtils.splitDate(
      new ReportDateUtils(period.from),
      new ReportDateUtils(period.to),
      10,
    );
    const credentials = await this.getSpCredentials();
    const client = await this.spReportService.getSpApiClient(credentials, this.brandName);
    for (const date of separatedDays) {
      const reportId = await this.spReportService.requestReport(
        this.brandName,
        credentials,
        'GET_MERCHANT_LISTINGS_ALL_DATA',
        client,
        date.from.date,
        date.to.date,
      );
      if (!reportId) continue;
      await new ReportLogsUtils(this.client, this.brandId, this.commerce).createRequestedReportLog(
        reportId,
        credentials.marketPlaceName,
        credentials.marketPlaceId,
        date.from.date.toISOString(),
        date.to.date.toISOString(),
        'GET_MERCHANT_LISTINGS_ALL_DATA',
      );
    }
  }

  private async requestAdsProductReport() {
    const credentials = await this.adsReportService.getAdsCredentials(this.client);
    const spCredential = await this.spReportService.getSpCredentials(this.client);
    if (!spCredential) {
      return;
    }
    await this.requestAdsProductReportPerCredential(credentials, spCredential.marketPlaceId);
  }

  private async requestCampaignBrandReport() {
    const credentials = await this.adsReportService.getAdsCredentials(this.client);
    const spCredentials = await this.spReportService.getSpCredentials(this.client);
    if (!spCredentials) {
      return;
    }
    await this.requestCampaignBrandReportPerCredential(credentials, spCredentials.marketPlaceId);
  }

  private async requestCampaignDisplayReport(tactic: 't20' | 't30') {
    const credentials = await this.adsReportService.getAdsCredentials(this.client);
    const spCredentials = await this.spReportService.getSpCredentials(this.client);
    if (!spCredentials) {
      return;
    }
    await this.requestCampaignDisplayReportPerCredential(credentials, spCredentials.marketPlaceId, tactic);
  }

  private async requestAdsProductReportPerCredential(credentials: user_credentials[], market_place_id: string) {
    const period = await this.calculateReportPeriod(-60 + 7);
    if (period.from.getTime() >= new ReportDateUtils(new Date()).date.getTime()) {
      return;
    }
    period.from = new ReportDateUtils(period.from).addDays(-7);
    const separatedDays = ReportDateUtils.splitDate(
      new ReportDateUtils(period.from),
      new ReportDateUtils(period.to),
      0,
    );
    for (const date of separatedDays) {
      const reportId = await this.adsReportService.requestProductAdsReport(
        credentials,
        market_place_id,
        date.to.date,
        this.brandName,
        this.brandId,
      );
      await new ReportLogsUtils(this.client, this.brandId, this.commerce).createRequestedReportLog(
        reportId,
        '',
        market_place_id,
        date.from.date.toISOString(),
        date.to.date.toISOString(),
        'AdsProductReport',
      );
    }
  }

  private async requestCampaignBrandReportPerCredential(credentials: user_credentials[], market_place_id: string) {
    const period = await this.calculateReportPeriod(-60 + 7);
    if (period.from.getTime() >= new ReportDateUtils(new Date()).date.getTime()) {
      return;
    }
    period.from = new ReportDateUtils(period.from).addDays(-7);
    const separatedDays = ReportDateUtils.splitDate(
      new ReportDateUtils(period.from),
      new ReportDateUtils(period.to),
      0,
    );
    for (const date of separatedDays) {
      const report = await this.adsReportService.requestCampaignBrandReport(
        credentials,
        market_place_id,
        date.to.date,
        this.brandName,
      );
      await new ReportLogsUtils(this.client, this.brandId, this.commerce).createRequestedReportLog(
        report.reportId,
        '',
        market_place_id,
        date.from.date.toISOString(),
        date.to.date.toISOString(),
        'CampaignBrandReport',
      );
    }
  }

  private async requestCampaignDisplayReportPerCredential(
    credentials: user_credentials[],
    market_place_id: string,
    tactic: 't20' | 't30',
  ) {
    const period = await this.calculateReportPeriod(-60 + 7);
    if (period.from.getTime() >= new ReportDateUtils(new Date()).date.getTime()) {
      return;
    }
    period.from = new ReportDateUtils(period.from).addDays(-7);
    const separatedDays = ReportDateUtils.splitDate(
      new ReportDateUtils(period.from),
      new ReportDateUtils(period.to),
      0,
    );
    for (const date of separatedDays) {
      const report = await this.adsReportService.requestCampaignDisplayReport(
        credentials,
        market_place_id,
        date.to.date,
        tactic,
        this.brandName,
      );
      await new ReportLogsUtils(this.client, this.brandId, this.commerce).createRequestedReportLog(
        report.reportId,
        '',
        market_place_id,
        date.from.date.toISOString(),
        date.to.date.toISOString(),
        `CampaignDisplayReportT${tactic === 't20' ? '20' : '30'}`,
      );
    }
  }

  private async getSpCredentials() {
    const credentials = await this.spReportService.getSpCredentials(this.client);
    if (!credentials) {
      throw new Error('Credential not found!');
    }
    return credentials;
  }

  private async calculateReportPeriod(defaultDays: number) {
    if (this.period) {
      return {
        from: new ReportDateUtils(this.period.startDate).date,
        to: new ReportDateUtils(this.period.endDate).date,
      };
    }
    const prevReport = await this.findPreviousReport();
    if (!prevReport) {
      return {
        from: new ReportDateUtils(new Date()).addDays(defaultDays),
        to: new ReportDateUtils(new Date()).date,
      };
    }
    const from = new ReportDateUtils(new Date(prevReport.data_end_time ?? '')).addDays(1);
    const to = new ReportDateUtils(new Date()).date;
    const difference = new ReportDateUtils(to).getDays(from);
    const finalFrom = difference < defaultDays ? new ReportDateUtils(new Date()).addDays(defaultDays) : from;
    return {
      from: finalFrom,
      to: from.getTime() > to.getTime() ? from : to,
    };
  }

  private async findPreviousReport() {
    return this.client.report_log.findFirst({
      where: {
        report_type: this.reportType,
      },
      orderBy: {
        data_end_time: 'desc',
      },
    });
  }
}
