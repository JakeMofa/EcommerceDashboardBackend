import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { VendoCommerceDBService } from '../prisma.service';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import * as qs from 'querystring';
import * as _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import { PrismaClient as PrismaVendoBrand } from 'prisma/brand/generated/vendoBrand';
import { ClientManagerUtils } from './utils/clientManager.utils';

const marketplaceIdMap = {
  A2EUQ1WTGCTBG2: 'CA', // Canada
  ATVPDKIKX0DER: 'US', // USA
  A1AM78C64UM0Y8: 'MX', // Mexico
  A1PA6795UKMFR9: 'DE', // Germany
  A1RKKUPIHCS9HS: 'ES', // Spain
  A13V1IB3VIYZZH: 'FR', // France
  A1F83G8C2ARO7P: 'UK', // UK
  A21TJRUUN4KGV: 'IN', // India
  A1VC38T7YXB528: 'JP', // Japan
  AAHKV2X7AFYLW: 'CN', // China
  A39IBJ37TRP1C6: 'AU', // Australia
  A33AVAJ2PDY3EV: 'TR', // Turkey
  A2Q3Y263D00KWC: 'BR', // Brazil
  A1C3SOZRARQ6R3: 'AE', // United Arab Emirates
  A2VIGQ35RCS4UG: 'SG', // Singapore
  AN7K5KH9FBRE2: 'NL', // Netherlands
};
@Injectable()
export class AmazonService {
  constructor(
    public commerceDB: VendoCommerceDBService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}
  private logger = new Logger(AmazonService.name);
  private dbConnection: PrismaVendoBrand;
  private clientManagerUtil = new ClientManagerUtils();

  async getDbConnection(dbName: string) {
    this.logger.debug('connecting to db ' + dbName);
    this.dbConnection = new PrismaVendoBrand({
      datasources: { db: { url: process.env.DATABASE_URL + dbName } },
    });
    await this.dbConnection.$connect();
    this.logger.debug('connected to db ' + dbName);
    return this.dbConnection;
  }
  async getSpCredentials() {
    return this.commerceDB.user_sp_credentials.findFirstOrThrow();
  }
  async exchangeCodeForToken({
    code,
    clientCreds = { clientId: '', clientSecret: '' },
    ads = false,
    marketPlace,
  }: {
    code: string;
    clientCreds?: { clientId: string; clientSecret: string };
    ads?: boolean;
    marketPlace: string;
  }) {
    // const { usp_client_id, usp_client_secret } = await this.getSpCredentials();
    // const param = {
    //   grant_type: 'authorization_code',
    //   code,
    //   client_id: ads ? this.configService.get('ADS_CLIENT_ID') : usp_client_id,
    //   client_secret: ads ? this.configService.get('ADS_CLIENT_SECRET') : usp_client_secret,
    //   redirect_uri: '',
    // };

    const param = {
      grant_type: 'authorization_code',
      code,
      client_id: ads ? this.configService.get('ADS_CLIENT_ID') : clientCreds?.clientId,
      client_secret: ads ? this.configService.get('ADS_CLIENT_SECRET') : clientCreds?.clientSecret,
      redirect_uri: '',
    };
    // const region = this.getRegion(marketPlace);
    // let url: string;
    // if (region === 'EU') {
    //   url = 'https://api.amazon.co.uk/auth/o2/token';
    // } else {
    const url = 'https://api.amazon.com/auth/o2/token';
    // }
    const { data } = await firstValueFrom(
      this.httpService
        .post<any>(url, qs.stringify(param), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.toJSON());
            this.logger.error(error.message);
            throw 'token An error happened! , ' + error.message;
          }),
        ),
    );
    this.logger.log(data);
    return data;
  }
  async storeSpCredential({ selling_partner_id, spapi_oauth_code, state }) {
    // state=${brand.id}!!${encodeURIComponent(
    //   values.seller_account_name
    // )}!!${values.usp_region}!!${values.marketplace}

    const [brandId, userId, sellerName, region, marketplace_id] = state.split('!!');
    this.logger.log(
      'seller central credentials audit log',
      'brandId: ' + brandId + ' userId: ' + userId + ' marketPlace: ' + marketplace_id,
    );
    const clientCreds = this.clientManagerUtil.getClientInfoByMarketPlace(marketplace_id) || {
      clientId: '',
      clientSecret: '',
    };
    try {
      const tokens = await this.exchangeCodeForToken({
        code: spapi_oauth_code,
        clientCreds,
        marketPlace: marketplace_id,
      });
      const brand = await this.commerceDB.brands.findUnique({
        where: {
          id: parseInt(brandId),
        },
      });
      if (!brand) throw new NotFoundException('Brand not found');
      if (!brand.db_name) throw new NotFoundException('Brand DB not found');
      await this.getDbConnection(brand.db_name);

      // const { usp_client_id, usp_client_secret } = await this.getSpCredentials();
      this.logger.log('state: ', state.split('!!'));
      this.logger.log('clientCreds: ', clientCreds);
      const creds_detail = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        client_id: clientCreds?.clientId,
        client_secret: clientCreds?.clientSecret,
        access_key: this.configService.get('AWS_ACCESS_KEY'),
        secret_key: this.configService.get('AWS_SECRET_KEY'),
        role_arn: this.configService.get('AWS_ROLE_ARN'),
        selling_partner_id,
        seller_name: decodeURIComponent(sellerName),
        region,
      };
      const spBrandCred = await this.dbConnection.user_credentials.findMany({
        where: {
          credential_type: 'SP-API',
        },
      });
      if (spBrandCred.length > 0) {
        await this.dbConnection.user_credentials.update({
          where: {
            id: spBrandCred[0].id,
          },
          data: {
            app_id: 1,
            marketplace_id,
            app_type: 'Marketplace',
            marketplace: marketplaceIdMap[marketplace_id],
            status: 1,
            credential_type: 'SP-API',
            credential_details: JSON.stringify(creds_detail),
            updated_at: new Date().getTime(),
          },
        });
      } else {
        await this.dbConnection.user_credentials.create({
          data: {
            app_id: 1,
            marketplace_id,
            app_type: 'Marketplace',
            marketplace: marketplaceIdMap[marketplace_id],
            status: 1,
            credential_type: 'SP-API',
            credential_details: JSON.stringify(creds_detail),
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
          },
        });
      }
      await this.dbConnection.$disconnect();
    } catch (e) {
      this.logger.error(e);
    }
    return brandId;
  }

  async fetchBrandCredentials() {
    return await this.dbConnection.user_credentials.findMany({
      where: { credential_type: 'SP-API' },
    });
  }

  async fetchProfiles(tokens, marketPlace) {
    const region = this.getRegion(marketPlace);
    let url: string;
    if (region === 'EU') {
      url = 'https://advertising-api-eu.amazon.com/v2/profiles';
    } else {
      url = 'https://advertising-api.amazon.com/v2/profiles';
    }
    return firstValueFrom(
      this.httpService
        .get<unknown>(url, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Amazon-Advertising-API-ClientId': this.configService.get('ADS_CLIENT_ID'),
            'Content-Type': 'application/json',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw 'profile An error happened! , ' + error.message;
          }),
        ),
    );
  }

  async fetchBrand(state) {
    return await this.commerceDB.brands.findUnique({
      where: { id: parseInt(state) },
    });
  }

  async getMatchedProfiles(data, sellerPartnerId) {
    return data.filter((profile) => profile.accountInfo.id == sellerPartnerId);
  }

  async storeOrUpdateProfiles(allProfiles: any[], tokens: any): Promise<any[]> {
    // Step 1: Fetch all existing records for the profiles
    const existingRecordsResults = await Promise.all(
      allProfiles.map((profile) =>
        this.dbConnection.user_credentials.findFirst({
          where: {
            marketplace: profile.countryCode,
            credential_type: 'Advertising-API',
          },
        }),
      ),
    );

    // Step 2: Construct a map for quick look-up
    const existingRecordsMap = {};
    allProfiles.forEach((profile, index) => {
      if (existingRecordsResults[index]) {
        existingRecordsMap[profile.countryCode] = existingRecordsResults[index];
      }
    });

    // Step 3: Determine actions based on profiles and existing records map
    const actions = allProfiles.map((profile) => {
      const body = {
        app_id: 1,
        seller_id: profile.accountInfo.id,
        marketplace_id: profile.accountInfo.marketplaceStringId,
        country_code: profile.countryCode,
        currency_code: profile.currencyCode,
        daily_budget: 999999999,
        time_zone: profile.timezone,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        seller_name: '',
        client_id: this.configService.get('ADS_CLIENT_ID'),
        client_secret: this.configService.get('ADS_CLIENT_SECRET'),
        token_type: 'bearer',
        access_token_expiry: 3600,
        profile_id: profile.profileId,
      };

      const existingRecord = existingRecordsMap[profile.countryCode];

      if (existingRecord) {
        return this.dbConnection.user_credentials.update({
          where: { id: existingRecord.id },
          data: {
            app_id: 1,
            credential_details: JSON.stringify(body),
            updated_at: new Date().getTime(),
          },
        });
      }

      return this.dbConnection.user_credentials.create({
        data: {
          app_id: 1,
          marketplace_id: profile.accountInfo.marketplaceStringId,
          status: 1,
          app_type: 'Marketplace',
          credential_type: 'Advertising-API',
          marketplace: body.country_code,
          credential_details: JSON.stringify(body),
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
        },
      });
    });

    // Use Prisma transaction to ensure all operations either succeed together or fail together
    return this.dbConnection.$transaction(actions);
  }

  async storeAdsCredential({ code, state }) {
    // state=${brand.id}&&marketPlace=${marketPlace}
    const [brandId, userId, marketPlace] = state.split('!!');
    const tokens = await this.exchangeCodeForToken({ code, ads: true, marketPlace });
    this.logger.log(
      'advertsing credentials audit log',
      'brandId: ' + brandId + ' userId: ' + userId + ' marketPlace: ' + marketPlace,
    );
    const brand = await this.fetchBrand(brandId);
    if (!brand) throw new NotFoundException('Brand not found');
    if (!brand.db_name) throw new NotFoundException('Brand DB not found');
    await this.getDbConnection(brand.db_name);

    const spBrandCred = await this.fetchBrandCredentials();
    const sellerPartnerId = JSON.parse(spBrandCred[0].credential_details || '').selling_partner_id;
    this.logger.debug('storing ads credentials for seller' + sellerPartnerId);
    const { data } = await this.fetchProfiles(tokens, marketPlace);

    if (Array.isArray(data) && data.length < 1) throw new NotFoundException('No profile found');

    const matchedProfilesWithSellerId: any[] = await this.getMatchedProfiles(data, sellerPartnerId);
    this.logger.debug(`matched ${matchedProfilesWithSellerId.length} profiles for the seller ${sellerPartnerId}`);
    this.logger.debug(`ALL profiles`, data);
    this.logger.debug(`matched profiles`, matchedProfilesWithSellerId);

    try {
      await this.storeOrUpdateProfiles(matchedProfilesWithSellerId, tokens);
      this.logger.log(
        `stored ${matchedProfilesWithSellerId.length} advertising credentials for seller id ${sellerPartnerId}`,
      );
      await this.dbConnection.$disconnect();
    } catch (e) {
      this.logger.error('Error occurred while storing or updating ads credentials', e);
      await this.dbConnection.$disconnect();
      throw e;
    }

    return state;
  }
  getRegion(marketPlace: string) {
    switch (marketPlace) {
      case 'A2EUQ1WTGCTBG2':
      case 'ATVPDKIKX0DER':
      case 'A1AM78C64UM0Y8':
      case 'A2Q3Y263D00KWC':
      case 'CA':
      case 'US':
      case 'MX':
      case 'BR':
        return 'NA';
      case 'A1RKKUPIHCS9HS':
      case 'A1F83G8C2ARO7P':
      case 'A13V1IB3VIYZZH':
      case 'AMEN7PMS3EDWL':
      case 'A1805IZSGTT6HS':
      case 'A1PA6795UKMFR9':
      case 'APJ6JRA9NG5V4':
      case 'A2NODRKZP88ZB9':
      case 'AE08WJ6YKNBMC':
      case 'A1C3SOZRARQ6R3':
      case 'ARBP9OOSHTCHU':
      case 'A33AVAJ2PDY3EV':
      case 'A17E79C6D8DWNP':
      case 'A2VIGQ35RCS4UG':
      case 'A21TJRUUN4KGV':
      case 'ES':
      case 'UK':
      case 'FR':
      case 'BE':
      case 'NL':
      case 'DE':
      case 'IT':
      case 'SE':
      case 'ZA':
      case 'PL':
      case 'EG':
      case 'TR':
      case 'SA':
      case 'AE':
      case 'IN':
        return 'EU';
      default:
        return null;
    }
  }
}
