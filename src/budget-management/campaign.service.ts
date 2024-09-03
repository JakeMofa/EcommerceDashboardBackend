import { BadRequestException, Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { VendoCommerceDBService } from 'src/prisma.service';
import * as _ from 'lodash';
import dayjs from 'src/utils/date.util';
import { TagService } from './tag.service';
import { UpdateCampaignArgs } from 'src/walmart-communicator';
import { CampaignApiService } from 'src/walmart-campaign/campaign.service';
import { BulkUpdateCampaignArgs } from 'src/walmart-campaign/dto/campaign-filters.dto';

@Injectable()
export class CampaignService {
  constructor(
    private readonly commerceDb: VendoCommerceDBService,
    @Inject(forwardRef(() => TagService))
    private readonly tagService: TagService,
    private readonly campaignApiService: CampaignApiService,
  ) {}

  async bulkUpdateApiCampaignsByTag({
    brandId,
    advertiser_id,
    tagId,
    data,
  }: {
    brandId: number;
    tagId: number;
    advertiser_id: string;
    data: UpdateCampaignArgs;
  }) {
    const result: BulkUpdateCampaignArgs = { campaigns: [] };
    const tag = await this.tagService.findByTagId({ brandId, id: tagId });
    if (!tag?.walmart_campaigns || tag?.walmart_campaigns.length === 0) {
      throw new BadRequestException('Campaign not found');
    } else {
      for (const campaign of tag.walmart_campaigns) {
        result.campaigns.push({
          ...data,
          campaign_id: campaign.id,
        });
      }
      this.campaignApiService.bulkUpdate(result, advertiser_id);
    }
  }
  async getCampaignSpending({
    brandId,
    walmart_tagId,
    date,
    budget_type,
  }: {
    brandId: number;
    walmart_tagId?: any;
    date?: string;
    budget_type?: 'brand' | 'tag' | 'all';
  }) {
    const campaignCondition = this.createCampaignCondition(budget_type, walmart_tagId);
    const spendData = await this.fetchSpendData(brandId, campaignCondition, date);

    return this.transformSpendData(spendData);
  }

  async getSpendingForAllTags({ brandId }: { brandId: number }) {
    const tags = await this.fetchTagsWithCampaigns(brandId);

    return tags.map((tag) => ({
      ...tag,
      walmart_campaigns: tag.walmart_campaigns.map((campaign) => _.omit(campaign, 'walmart_campaign_stat')),
      spending: this.transformSpendData(this.extractSpendData(tag.walmart_campaigns)),
    }));
  }

  async getSpendingByTagId({ brandId, tagId }: { brandId: number; tagId: number }) {
    const campaignCondition = this.createCampaignCondition('tag', tagId);
    const spendData = await this.fetchSpendData(brandId, campaignCondition);

    return this.transformSpendData(spendData);
  }

  private createCampaignCondition(budget_type: 'brand' | 'tag' | 'all' | undefined, walmart_tagId?: any) {
    if (budget_type === 'tag' && walmart_tagId) {
      return { walmart_tags: { some: { id: _.toNumber(walmart_tagId) } } };
    }
    return {};
  }

  private async fetchSpendData(brandId: number, campaignCondition: any, date?: string) {
    const spends = await this.commerceDb.walmart_campaign_stat.groupBy({
      by: ['date'],
      where: {
        campaign: {
          brandId,
          ...campaignCondition,
        },
        ...(date ? { date: this.createDateCondition(date) } : {}),
      },
      _sum: { spend: true },
    });

    return spends;
  }

  private createDateCondition(date: string) {
    return {
      gte: new Date(dayjs(date).startOf('month').format('YYYY-MM-DD')),
      lte: new Date(dayjs(date).endOf('month').format('YYYY-MM-DD')),
    };
  }

  private transformSpendData(spendData: any) {
    const transformedData = spendData.map((day) => ({
      date: day.date,
      spend: day._sum?.spend || day.spend,
    }));

    return {
      daily: this.groupByDate(transformedData, 'YYYY-MM-DD'),
      monthly: this.groupByDate(transformedData, 'YYYY-MM'),
    };
  }

  private groupByDate(data: any[], dateFormat: string) {
    return _(data)
      .groupBy((day) => dayjs(day.date).format(dateFormat))
      .map((days, date) => ({
        date,
        spend: _.sumBy(days, 'spend'),
      }))
      .value();
  }

  private async fetchTagsWithCampaigns(brandId: number) {
    return this.commerceDb.walmart_tag.findMany({
      where: { brand: { id: brandId } },
      include: {
        walmart_campaigns: {
          include: {
            walmart_campaign_stat: true,
          },
        },
      },
    });
  }

  private extractSpendData(campaigns: any[]) {
    return campaigns.flatMap((campaign) =>
      campaign.walmart_campaign_stat.map((stat) => ({
        date: stat.date,
        spend: stat.spend,
      })),
    );
  }
}
