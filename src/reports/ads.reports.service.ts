import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient as PrismaVendoBrand, user_credentials } from '../../prisma/brand/generated/vendoBrand';
import { CredentialsAdsDto } from '../advertising/dto/credentials.ads.dto';
import {
  HttpClient,
  OAuthClient,
  OperationProvider,
  SponsoredBrandsReportOperation,
  SponsoredDisplayReportOperation,
  SponsoredProductsReportOperation,
} from '@scaleleap/amazon-advertising-api-sdk';
import { amazonMarketplaces } from '@scaleleap/amazon-marketplaces';
import { ReportLogsUtils } from './utils/reportLogs.utils';
import axios from 'axios';
import * as process from 'process';
import { ClientManagerUtils } from './utils/clientManager.utils';

@Injectable()
export class AdsReportsService {
  private readonly clientManager = new ClientManagerUtils();
  private readonly logger = new Logger(AdsReportsService.name);

  async getAdsCredentials(client: PrismaVendoBrand): Promise<user_credentials[]> {
    return client.user_credentials.findMany({
      where: {
        credential_type: 'Advertising-API',
      },
    });
  }

  async requestProductAdsReport(
    cred: user_credentials[],
    market_place_id: string,
    date: Date,
    brandName: string,
    brandId: number,
  ) {
    return await ReportLogsUtils.fallback(async () => {
      this.logger.log(`Requesting ads product report for brand ${brandName} for date ${date.toISOString()}`);
      const data = await axios.post<{ report_id: string }>(`${process.env.REPORT_MANAGER_URL}/advertising/request`, {
        type: 'product',
        date: date.toISOString().split('T')[0],
        brand_id: brandId,
        market_place_id,
      });
      return data.data.report_id;
    }, this.logger);
  }

  async requestCampaignBrandReport(cred: user_credentials[], market_place_id: string, date: Date, brandName: string) {
    return await ReportLogsUtils.fallback(async () => {
      this.logger.log(`Requesting ads campaign brand report for brand ${brandName} for date ${date.toISOString()}`);
      const [, client] = await this.getClient(cred, market_place_id);
      return (await client.post('/v2/hsa/campaigns/report', {
        reportDate: date.toISOString().split('T')[0].replaceAll('-', ''),
        metrics:
          'attributedConversions14d,attributedConversions14dSameSKU,attributedSales14d,attributedSales14dSameSKU,campaignBudget,campaignBudgetType,campaignName,campaignStatus,clicks,cost,dpv14d,impressions,vctr,video5SecondViewRate,video5SecondViews,videoCompleteViews,videoFirstQuartileViews,videoMidpointViews,videoThirdQuartileViews,videoUnmutes,viewableImpressions,vtr,dpv14d,attributedDetailPageViewsClicks14d,attributedOrderRateNewToBrand14d,attributedOrdersNewToBrand14d,attributedOrdersNewToBrandPercentage14d,attributedSalesNewToBrand14d,attributedSalesNewToBrandPercentage14d,attributedUnitsOrderedNewToBrand14d,attributedUnitsOrderedNewToBrandPercentage14d,attributedBrandedSearches14d,currency,topOfSearchImpressionShare',
        creativeType: 'all',
      })) as { reportId: string; status: 'SUCCESS' | 'IN_PROGRESS' | 'FAILURE'; statusDetails: string } & {
        recordType?: string | undefined;
        location?: string | undefined;
        fileSize?: number | undefined;
      };
    }, this.logger);
  }

  async requestCampaignDisplayReport(
    cred: user_credentials[],
    market_place_id: string,
    date: Date,
    tactic: 't20' | 't30' = 't30',
    brandName: string,
  ) {
    return await ReportLogsUtils.fallback(async () => {
      this.logger.log(
        `Requesting ads campaign display ${tactic} report for brand ${brandName} for date ${date.toISOString()}`,
      );
      const [client] = await this.getClient(cred, market_place_id);
      const reportOperation = client.create(SponsoredDisplayReportOperation);
      return reportOperation.requestReport({
        recordType: 'campaigns',
        reportDate: date.toISOString().split('T')[0].replaceAll('-', ''),
        tactic: tactic === 't30' ? 'T00030' : 'T00020',
        metrics: [
          'attributedSales14d',
          'attributedConversions14dSameSKU',
          'attributedConversions1d',
          'attributedConversions1dSameSKU',
          'attributedConversions30d',
          'attributedConversions30dSameSKU',
          'attributedConversions7d',
          'attributedConversions7dSameSKU',
          'attributedSales14d',
          'attributedSales14dSameSKU',
          'attributedSales1d',
          'attributedSales1dSameSKU',
          'attributedSales30d',
          'attributedSales30dSameSKU',
          'attributedSales7d',
          'attributedSales7dSameSKU',
          'attributedUnitsOrdered14d',
          'attributedUnitsOrdered1d',
          'attributedUnitsOrdered30d',
          'attributedUnitsOrdered7d',
          'campaignId',
          'campaignName',
          'campaignStatus',
          'clicks',
          'cost',
          'currency',
          'impressions',
          'attributedConversions14d',
          'viewAttributedConversions14d',
          'viewAttributedDetailPageView14d',
          'viewAttributedSales14d',
          'viewAttributedUnitsOrdered14d',
          'viewImpressions',
        ] as any,
      });
    }, this.logger);
  }

  async getRequestedProductAdsReport(
    cred: user_credentials[],
    market_place_id: string,
    reportId: string,
    brandId: number,
  ) {
    return await ReportLogsUtils.fallback(async () => {
      const data = await axios.post<{
        status: string;
        url: string;
      }>(`${process.env.REPORT_MANAGER_URL}/advertising/get`, {
        report_id: reportId,
        brand_id: brandId,
        market_place_id: market_place_id,
      });
      return { ...data.data, reportId };
    }, this.logger);
  }

  async getRequestedCampaignBrandReport(cred: user_credentials[], market_place_id: string, reportId: string) {
    return await ReportLogsUtils.fallback(async () => {
      const [client] = await this.getClient(cred, market_place_id);
      const reportOperation = client.create(SponsoredBrandsReportOperation);
      return reportOperation.getReport(reportId);
    }, this.logger);
  }

  async getRequestedCampaignDisplayReport(cred: user_credentials[], market_place_id: string, reportId: string) {
    return await ReportLogsUtils.fallback(async () => {
      const [client] = await this.getClient(cred, market_place_id);
      const reportOperation = client.create(SponsoredDisplayReportOperation);
      return reportOperation.getReport(reportId);
    }, this.logger);
  }

  async downloadRequestedProductAdsReport(
    cred: user_credentials[],
    market_place_id: string,
    reportId: string,
    brandId: number,
  ) {
    return await ReportLogsUtils.fallback(async () => {
      const report = await this.getRequestedProductAdsReport(cred, market_place_id, reportId, brandId);
      const data = await axios.post<{ data: string }>(`${process.env.REPORT_MANAGER_URL}/advertising/download`, {
        url: report.url,
        brand_id: brandId,
        market_place_id,
      });
      const reportData = JSON.parse(data.data.data);
      return reportData;
    }, this.logger);
  }

  async downloadRequestedCampaignBrandReport(cred: user_credentials[], market_place_id: string, reportId: string) {
    return await ReportLogsUtils.fallback(async () => {
      const [client] = await this.getClient(cred, market_place_id);
      const reportOperation = client.create(SponsoredBrandsReportOperation);
      return reportOperation.downloadReport(reportId);
    }, this.logger);
  }

  async downloadRequestedCampaignDisplayReport(cred: user_credentials[], market_place_id: string, reportId: string) {
    return await ReportLogsUtils.fallback(async () => {
      const [client] = await this.getClient(cred, market_place_id);
      const reportOperation = client.create(SponsoredDisplayReportOperation);
      return reportOperation.downloadReport(reportId);
    }, this.logger);
  }

  async getClient(credentials: user_credentials[], market_place_id: string): Promise<[OperationProvider, HttpClient]> {
    const adsCredential = this.exportAdsCredential(credentials, market_place_id);
    if (!adsCredential) {
      throw new Error('Credentials for marketplace not found!');
    }
    const client = new OAuthClient(
      {
        clientId: adsCredential.client_id,
        clientSecret: adsCredential.client_secret,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.getMarketPlaceById(market_place_id),
    );
    const token = await client.createToken(adsCredential.access_token, adsCredential.refresh_token);
    const tokenRes = await token.refresh();
    const httpClient = new HttpClient('https://advertising-api.amazon.com', {
      accessToken: tokenRes.accessToken,
      clientId: adsCredential.client_id,
      scope: adsCredential.profile_id,
    });
    return [new OperationProvider(httpClient), httpClient];
  }

  exportAdsCredential(credentials: user_credentials[], market_place_id: string): CredentialsAdsDto | undefined {
    const details = credentials.map(
      (credential) => JSON.parse(credential.credential_details ?? '{}') as CredentialsAdsDto,
    );
    const foundAds = details.find((c) => c.marketplace_id === market_place_id);
    const clientCredentials = this.clientManager.getClientInfoByMarketPlace(market_place_id);
    if (!foundAds || !clientCredentials) {
      return undefined;
    }
    return {
      ...foundAds,
      client_id: clientCredentials.clientId,
      client_secret: clientCredentials.clientSecret,
      seller_name: clientCredentials.sellerName,
    };
  }

  private getMarketPlaceById(marketPlaceId: string) {
    switch (marketPlaceId) {
      case 'A2EUQ1WTGCTBG2':
        return amazonMarketplaces.CA;
      case 'ATVPDKIKX0DER':
        return amazonMarketplaces.US;
      case 'A1AM78C64UM0Y8':
        return amazonMarketplaces.MX;
      case 'A2Q3Y263D00KWC':
        return amazonMarketplaces.BR;
      case 'A1RKKUPIHCS9HS':
        return amazonMarketplaces.ES;
      case 'A1F83G8C2ARO7P':
        return amazonMarketplaces.GB;
      case 'A13V1IB3VIYZZH':
        return amazonMarketplaces.FR;
      case 'AMEN7PMS3EDWL':
        return amazonMarketplaces.BE;
      case 'A1805IZSGTT6HS':
        return amazonMarketplaces.NL;
      case 'A1PA6795UKMFR9':
        return amazonMarketplaces.DE;
      case 'APJ6JRA9NG5V4':
        return amazonMarketplaces.IT;
      case 'A2NODRKZP88ZB9':
        return amazonMarketplaces.SE;
      case 'A1C3SOZRARQ6R3':
        return amazonMarketplaces.PL;
      case 'ARBP9OOSHTCHU':
        return amazonMarketplaces.EG;
      case 'A33AVAJ2PDY3EV':
        return amazonMarketplaces.TR;
      case 'A17E79C6D8DWNP':
        return amazonMarketplaces.SA;
      case 'A2VIGQ35RCS4UG':
        return amazonMarketplaces.AE;
      case 'A21TJRUUN4KGV':
        return amazonMarketplaces.IN;
      case 'A19VAU5U5O7RUS':
        return amazonMarketplaces.SG;
      case 'A39IBJ37TRP1C6':
        return amazonMarketplaces.AU;
      case 'A1VC38T7YXB528':
        return amazonMarketplaces.JP;
      default:
        throw new Error('Market place id not valid!');
    }
  }
}
