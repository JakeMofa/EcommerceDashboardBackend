import { Injectable } from '@nestjs/common';
import { AddAdItemToAdGroupReq, UpdateAdItemReq } from '../walmart-communicator';
import { PaginationOptions } from '../middlewares/pagination.middleware';
import { ListAdItemArgs } from './dto/ad-item.dto';
import { WalmartClient } from './walmart-client.service';

@Injectable()
export class AdItemService {
  constructor(private readonly walmartClient: WalmartClient) {}
  async addAdItem(data: AddAdItemToAdGroupReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignAdItemAddCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }

  async getAdItems(data: ListAdItemArgs, pagination: PaginationOptions, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignAdItemListRead({
      campaignId: data.campaign_id,
      advertiserId: advertiserId,
    });
    const { page, limit } = pagination;
    const allItemsList = response.data;
    const pageItemsList = allItemsList.slice((page - 1) * limit, page * limit);
    return { items: pageItemsList, page, limit, count: allItemsList.length };
  }

  async update(data: UpdateAdItemReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignAdItemUpdateUpdate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
}
