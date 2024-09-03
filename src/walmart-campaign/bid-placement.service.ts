import { Injectable } from '@nestjs/common';
import { BidPlacement } from '../walmart-communicator';
import { ListBidItemArgs } from './dto/bid';
import { WalmartClient } from './walmart-client.service';

@Injectable()
export class BidPlacementService {
  constructor(private readonly walmartClient: WalmartClient) {}

  async listBidPlacement(data: ListBidItemArgs, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignBidListRead({
      campaignId: data.campaign_id,
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async create(data: BidPlacement[], advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignBidCreateCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }

  async update(data: BidPlacement, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignBidUpdateUpdate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
}
