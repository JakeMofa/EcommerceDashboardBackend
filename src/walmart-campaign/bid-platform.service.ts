import { Injectable } from '@nestjs/common';
import { BidPlatform } from '../walmart-communicator';
import { ListBidPlatformItemArgs } from './dto/bid-platform';
import { WalmartClient } from './walmart-client.service';

@Injectable()
export class BidPlatformService {
  constructor(private readonly walmartClient: WalmartClient) {}

  async listBidPlatform(data: ListBidPlatformItemArgs, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignBidPlatformListRead({
      campaignId: data.campaign_id,
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async create(data: BidPlatform[], advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignBidPlatformCreateCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }

  async update(data: BidPlatform, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignBidPlatformUpdateUpdate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
}
