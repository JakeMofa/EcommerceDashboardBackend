import { Injectable } from '@nestjs/common';
import { CreateAdGroupReq, ListAdGroupArgs, UpdateAdGroupReq } from '../walmart-communicator';
import { PaginationOptions } from '../middlewares/pagination.middleware';
import { WalmartClient } from './walmart-client.service';

@Injectable()
export class AdGroupService {
  constructor(private readonly walmartClient: WalmartClient) {}
  async create(data: CreateAdGroupReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignAdGroupCreateCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }

  async getAdGroups(data: ListAdGroupArgs, pagination: PaginationOptions, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignAdGroupListCreate({
      data,
      advertiserId: advertiserId,
    });
    const { page, limit } = pagination;
    const allGroupsList = response.data;
    const pageGroupsList = allGroupsList.slice((page - 1) * limit, page * limit);
    return { items: pageGroupsList, page, limit, count: allGroupsList.length };
  }

  async update(data: UpdateAdGroupReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignAdGroupUpdateUpdate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
}
