import { Injectable } from '@nestjs/common';
import { Configuration, WalmartCampaignApi, WalmartCampaignApiFactory } from '../walmart-communicator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalmartClient {
  constructor(private readonly configService: ConfigService) {}
  createClient(advertiserId: string): WalmartCampaignApi {
    let config: Configuration;
    if (advertiserId == this.configService.get('WALMART_SANDBOX_ADVERTISER_ID')) {
      config = new Configuration({
        apiKey: this.configService.get('WALMART_DJANGO_APIKEY'),
        basePath: this.configService.get('WALMART_SANDBOX_DJANGO_BASE_URL'),
      });
    } else {
      config = new Configuration({
        apiKey: this.configService.get('WALMART_DJANGO_APIKEY'),
        basePath: this.configService.get('WALMART_PRODUCTION_DJANGO_BASE_URL'),
      });
    }
    return <WalmartCampaignApi>WalmartCampaignApiFactory(config);
  }
}
