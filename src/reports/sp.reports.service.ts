import { Injectable, Logger } from '@nestjs/common';
import { CredentialsSpDto } from '../advertising/dto/credentials.sp.dto';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { APIConfigurationParameters, ReportsApiClient } from '@scaleleap/selling-partner-api-sdk';
import { ReportEnum } from '../advertising/enum/report.enum';
import { SellingPartnerApiAuth } from '@sp-api-sdk/auth';
import { PrismaClient as PrismaVendoBrand } from '../../prisma/brand/generated/vendoBrand';
import { ReportLogsUtils } from './utils/reportLogs.utils';
import { PrismaClient as PrismaVendoCommerce } from '../../prisma/commerce/generated/vendoCommerce';
import { ClientManagerUtils } from './utils/clientManager.utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SpApiClient = require('amazon-sp-api');

@Injectable()
export class SpReportsService {
  private readonly clientManager = new ClientManagerUtils();

  constructor(private readonly dbService: PrismaVendoCommerce) {}

  private readonly logger = new Logger(SpReportsService.name);

  async getSpCredentials(client: PrismaVendoBrand): Promise<CredentialsSpDto | null> {
    const userCredentials = await client.user_credentials.findFirst({
      where: {
        credential_type: 'SP-API',
        app_type: 'Marketplace',
      },
    });
    const clientCredentials = this.clientManager.getClientInfoByMarketPlace(
      userCredentials?.marketplace_id ?? userCredentials?.marketplace ?? '',
    );
    if (!clientCredentials || !userCredentials) return null;
    const brandSpCredential: CredentialsSpDto = JSON.parse(userCredentials.credential_details ?? '{}');
    return {
      region: brandSpCredential.region ?? '',
      refresh_token: brandSpCredential.refresh_token ?? '',
      access_token: '',
      role_arn: brandSpCredential.role_arn ?? '',
      secret_key: brandSpCredential.secret_key ?? '',
      access_key: brandSpCredential.access_key ?? '',
      client_secret: clientCredentials.clientSecret ?? '',
      client_id: clientCredentials.clientId ?? '',
      seller_name: clientCredentials.sellerName ?? '',
      selling_partner_id: brandSpCredential.selling_partner_id,
      marketPlaceId: userCredentials.marketplace_id ?? '',
      marketPlaceName: userCredentials.marketplace ?? '',
    };
  }

  async getTokens(cred: CredentialsSpDto, brandName: string): Promise<APIConfigurationParameters> {
    const roleSessionName = `session-${Date.now()}`;
    const auth = new SellingPartnerApiAuth({
      clientId: cred.client_id,
      clientSecret: cred.client_secret,
      refreshToken: cred.refresh_token,
      accessKeyId: cred.access_key,
      secretAccessKey: cred.secret_key,
    });
    return ReportLogsUtils.fallback(
      async () => {
        const accessToken = await auth.accessToken.get();
        const stsClient = new STSClient({
          region: cred.region,
          credentials: {
            accessKeyId: cred.access_key,
            secretAccessKey: cred.secret_key,
          },
        });
        const { Credentials, AssumedRoleUser } = await stsClient.send(
          new AssumeRoleCommand({
            RoleArn: cred.role_arn,
            RoleSessionName: roleSessionName,
          }),
        );
        return {
          region: cred.region,
          accessToken: accessToken,
          roleArn: AssumedRoleUser?.Arn,
          credentials: {
            accessKeyId: Credentials?.AccessKeyId ?? '',
            secretAccessKey: Credentials?.SecretAccessKey ?? '',
            sessionToken: Credentials?.SessionToken ?? '',
          },
        };
      },
      this.logger,
      brandName,
    );
  }

  async getSpApiClient(credentials: CredentialsSpDto, brandName: string) {
    const options = await this.getTokens(credentials, brandName);
    const decryptor = new SpApiClient({
      options: {
        debug_log: true,
      },
      region: credentials.region === 'us-east-1' ? 'na' : credentials.region === 'eu-west-1' ? 'eu' : 'fe',
      access_token: options.accessToken,
      refresh_token: credentials.refresh_token,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_SECRET: credentials.client_secret,
        SELLING_PARTNER_APP_CLIENT_ID: credentials.client_id,
        AWS_ACCESS_KEY_ID: credentials.access_key,
        AWS_SECRET_ACCESS_KEY: credentials.secret_key,
        AWS_SELLING_PARTNER_ROLE: credentials.role_arn,
      },
    });
    return decryptor;
  }

  async requestReport(
    brandName: string,
    credentials: CredentialsSpDto,
    reportType: string,
    decryptor: any,
    startTime?: Date,
    endTime?: Date,
  ) {
    this.logger.log(`Requesting new sp report ${reportType}, from: ${startTime} to: ${endTime}`);
    return await ReportLogsUtils.fallback(
      async () => {
        const reportOptions = {};
        if (reportType === ReportEnum.GET_SALES_AND_TRAFFIC_REPORT) {
          reportOptions['asinGranularity'] = 'CHILD';
        }
        const res = await decryptor.callAPI({
          operation: 'createReport',
          endpoint: 'reports',
          body: {
            reportType: reportType,
            marketplaceIds: [credentials.marketPlaceId],
            dataStartTime: startTime?.toISOString(),
            dataEndTime: endTime?.toISOString(),
            reportOptions,
          },
        });
        this.logger.log(`Report of type ${reportType} has been created with id ${res.reportId}`);
        return res.reportId;
      },
      this.logger,
      brandName,
    );
  }

  async getFinanceEvents(
    brandName: string,
    credentials: CredentialsSpDto,
    decryptor: any,
    startTime: Date,
    endTime: Date,
  ) {
    this.logger.log(`Requesting finance events, from: ${startTime} to: ${endTime}`);
    return await ReportLogsUtils.fallback(
      async () => {
        const res = await decryptor.callAPI({
          operation: 'listFinancialEvents',
          query: {
            PostedAfter: startTime.toISOString(),
            PostedBefore: endTime.toISOString(),
          },
        });
        return res;
      },
      this.logger,
      brandName,
    );
  }

  async getRequestedReport(brandName: string, credentials: CredentialsSpDto, reportId: string) {
    return await ReportLogsUtils.fallback(
      async () => {
        const options = await this.getTokens(credentials, brandName);
        const client = new ReportsApiClient(options);
        const report = await client.getReport({
          reportId,
        });
        return report.data.payload;
      },
      this.logger,
      brandName,
    );
  }

  async downloadReportDocument(
    brandName: string,
    credentials: CredentialsSpDto,
    reportDocumentId: string,
    json = false,
    unzip = true,
  ) {
    return await ReportLogsUtils.fallback(
      async () => {
        this.logger.log(`Downloading document ${reportDocumentId}`);
        await this.sleep(500);
        const options = await this.getTokens(credentials, brandName);
        const decryptor = new SpApiClient({
          region: credentials.region === 'us-east-1' ? 'na' : credentials.region === 'eu-west-1' ? 'eu' : 'fe',
          access_token: options.accessToken,
          refresh_token: credentials.refresh_token,
          credentials: {
            SELLING_PARTNER_APP_CLIENT_SECRET: credentials.client_secret,
            SELLING_PARTNER_APP_CLIENT_ID: credentials.client_id,
            AWS_ACCESS_KEY_ID: credentials.access_key,
            AWS_SECRET_ACCESS_KEY: credentials.secret_key,
            AWS_SELLING_PARTNER_ROLE: credentials.role_arn,
          },
        });
        const report_document = await decryptor.callAPI({
          operation: 'getReportDocument',
          endpoint: 'reports',
          path: {
            reportDocumentId: reportDocumentId,
          },
        });
        const data = await decryptor.download(report_document);
        this.logger.log(`Fetching document ${reportDocumentId} done`);
        return data;
      },
      this.logger,
      brandName,
    );
  }

  sleep(ms: number) {
    return new Promise<void>((res) => {
      setTimeout(() => res(), ms);
    });
  }

  tsvToJson(tsv: string, lineSeparator = '\n') {
    const lines = tsv.split(lineSeparator);
    const headers = lines[0].split('\t');
    const allData: { [key: string]: string }[] = [];
    for (const row of lines.slice(1)) {
      const cols = row.split('\t');
      const data: { [key: string]: string } = {};
      for (let i = 0; i < headers.length; i++) {
        data[headers[i]] = cols[i];
      }
      allData.push(data);
    }
    return allData;
  }
}
