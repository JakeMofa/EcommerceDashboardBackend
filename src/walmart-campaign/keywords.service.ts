import { Injectable } from '@nestjs/common';
import { AddKeywordReq, GetKeywordAnalyticsReq, UpdateKeywordReq } from '../walmart-communicator';
import { PaginationOptions } from '../middlewares/pagination.middleware';
import { ListKeywordsArgs, ListKeywordsSuggestionArgs } from './dto/keywords.dto';
import { WalmartClient } from './walmart-client.service';

@Injectable()
export class KeywordsService {
  constructor(private readonly walmartClient: WalmartClient) {}
  async add(data: AddKeywordReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignKeywordsAddCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }

  async getKeywords(data: ListKeywordsArgs, pagination: PaginationOptions, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignKeywordsListRead({
      campaignId: data.campaign_id,
      advertiserId: advertiserId,
    });
    const { page, limit } = pagination;
    const allItemsList = response.data;
    const pageItemsList = allItemsList.slice((page - 1) * limit, page * limit);
    return { items: pageItemsList, page, limit, count: allItemsList.length };
  }
  async getSuggestions(data: ListKeywordsSuggestionArgs, pagination: PaginationOptions, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignKeywordsSuggestedRead({
      adGroupId: data.adGroupId,
      advertiserId: advertiserId,
    });
    const { page, limit } = pagination;
    const allItemsList = response.data;
    const pageItemsList = allItemsList.slice((page - 1) * limit, page * limit);
    return { items: pageItemsList, page, limit, count: allItemsList.length };
  }
  async getAnalytics(data: GetKeywordAnalyticsReq, pagination: PaginationOptions, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignKeywordsAnalyticsCreate({
      data: data,
      advertiserId: advertiserId,
    });
    const { page, limit } = pagination;
    const allItemsList = response.data;
    const pageItemsList = allItemsList.slice((page - 1) * limit, page * limit);
    return { items: pageItemsList, page, limit, count: allItemsList.length };
  }

  async update(data: UpdateKeywordReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignKeywordsUpdateUpdate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
}
