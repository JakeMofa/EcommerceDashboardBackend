import { Injectable } from '@nestjs/common';
import { CreateSVAdGroupArgs, ListSVAdGroupArgs, UpdateSVAdGroupArgs } from '../walmart-communicator';
import { PaginationOptions } from '../middlewares/pagination.middleware';
import { WalmartClient } from './walmart-client.service';

@Injectable()
export class SVAdGroupService {
  constructor(private readonly walmartClient: WalmartClient) {}
  async create(data: CreateSVAdGroupArgs[], advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignSvAdGroupCreateCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }

  async getSVAdGroups(data: ListSVAdGroupArgs, pagination: PaginationOptions, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignSvAdGroupListCreate({
      data,
      advertiserId: advertiserId,
    });
    const { page, limit } = pagination;
    const allGroupsList = response.data;
    const pageGroupsList = allGroupsList.slice((page - 1) * limit, page * limit);
    return { items: pageGroupsList, page, limit, count: allGroupsList.length };
  }

  async update(data: UpdateSVAdGroupArgs[], advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignSvAdGroupUpdateUpdate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
}
