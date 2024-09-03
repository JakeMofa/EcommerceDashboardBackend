import { Injectable } from '@nestjs/common';
import { SubmitPlacementReq } from '../walmart-communicator';
import { WalmartClient } from './walmart-client.service';
import { AdPlacementListReq } from './dto/ad-placement-list.dto';

@Injectable()
export class AdPlacementService {
  constructor(private readonly walmartClient: WalmartClient) {}

  async listAdPlacement(data: AdPlacementListReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignAdPlacementListCreate({
      campaignId: data.campaign_id,
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async update(data: SubmitPlacementReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignAdPlacementUpdateUpdate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
}
