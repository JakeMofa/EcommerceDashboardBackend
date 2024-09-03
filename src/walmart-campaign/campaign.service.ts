import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateCampaignReq, DeleteCampaignReq, UpdateCampaign, UpdateCampaignReq } from '../walmart-communicator';
import { PaginationOptions } from '../middlewares/pagination.middleware';
import { SearchCampaignItemsArgs } from './dto/campaign-items.dto';
import { GetStatsArgs } from './dto/stats.dto';
import { WalmartClient } from './walmart-client.service';
import * as _ from 'lodash';
import { BulkUpdateCampaignArgs, CampaignFilterRule, CampaignFiltersArgs } from './dto/campaign-filters.dto';

@Injectable()
export class CampaignApiService {
  logger = new Logger(CampaignApiService.name);
  constructor(private readonly walmartClient: WalmartClient) {}
  async create(data: CreateCampaignReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignCreateCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }

  async getCampaign(data: CampaignFiltersArgs, pagination: PaginationOptions, advertiserId: string) {
    data.advertiser_id = +advertiserId;
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignListCreate({
      data: {
        campaign_id: data.campaign_id,
        advertiser_id: data.advertiser_id,
        filter_name: data.filter_name,
        filter_last_modified_at: data.filter_last_modified_at,
      },
    });
    const { page, limit, order, orderBy } = pagination;
    let allCampaignList = _.orderBy(response.data, orderBy, order);
    //Filtering results
    allCampaignList = allCampaignList.filter((value) => {
      for (const filter of data.custom_filters) {
        if (filter.rule == CampaignFilterRule.EQUALS) {
          if (filter.value != value[filter.property_name]) return false;
        } else if (filter.rule == CampaignFilterRule.NOT_EQUALS) {
          if (filter.value == value[filter.property_name]) return false;
        } else if (filter.rule == CampaignFilterRule.LESS_THAN_OR_EQUALS) {
          if (filter.value < value[filter.property_name]) return false;
        } else if (filter.rule == CampaignFilterRule.LESS_THAN) {
          if (filter.value <= value[filter.property_name]) return false;
        } else if (filter.rule == CampaignFilterRule.GREATER_THAN_OR_EQUALS) {
          if (filter.value > value[filter.property_name]) return false;
        } else if (filter.rule == CampaignFilterRule.GREATER_THAN) {
          if (filter.value >= value[filter.property_name]) return false;
        }
      }
      return true;
    });
    const pageCampaignList = allCampaignList.slice((page - 1) * limit, page * limit);
    return { items: pageCampaignList, page, limit, count: allCampaignList.length };
  }

  async searchCampaignItems(data: SearchCampaignItemsArgs, pagination: PaginationOptions, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignItemsSearchRead({
      advertiserId: advertiserId,
      searchText: data.searchText,
    });
    const { page, limit } = pagination;
    const allCampaignList = response.data;
    const pageCampaignList = allCampaignList.slice((page - 1) * limit, page * limit);
    return { items: pageCampaignList, page, limit, count: allCampaignList.length };
  }

  async update(data: UpdateCampaignReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignUpdateUpdate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async bulkUpdate(data: BulkUpdateCampaignArgs, advertiserId: string) {
    const results: UpdateCampaign[] = [];
    const errors: { campaignId: number; error: string }[] = [];

    for (const campaign of data.campaigns) {
      try {
        const response = await this.update({ data: [campaign] }, advertiserId);
        results.push(response[0]);
      } catch (error) {
        this.logger.error(`Failed to update campaign with ID ${campaign.campaign_id}: ${error.message}`);
        errors.push({ campaignId: campaign.campaign_id, error: error.message });
      }
    }
    if (errors.length > 0) {
      this.logger.warn(`Bulk update completed with errors: ${JSON.stringify(errors)}`);
      throw new InternalServerErrorException({
        message: 'Bulk update completed with errors',
        errors,
      });
    }

    return results;
  }

  async remove(data: DeleteCampaignReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignDeleteUpdate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }

  async stats(data: GetStatsArgs, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignStatsRead({
      campaignId: data.campaign_id,
      advertiserId: advertiserId,
    });
    return response.data;
  }
}
