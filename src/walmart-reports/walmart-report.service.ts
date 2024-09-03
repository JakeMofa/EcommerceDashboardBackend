import { Injectable } from '@nestjs/common';
import { VendoCommerceDBService } from '../prisma.service';
import { AdReportsLogsReq } from './dto/ad-logs-req.dto';
import { WalmartCampaignClient, WalmartReportClient } from './walmart-reports-client.service';
import { CampaignTypes, PeriodType } from './dto/campaign-performance.dto';
import {
  AdItemGroupByRange,
  AdItemGroupByTypes,
  KeywordGroupByTypes,
  AdItemIncludeEnum,
} from './dto/ad-item-filter.dto';

import * as _ from 'lodash';
import { CampaignAdItemList, SearchItem } from 'src/walmart-communicator';
import { AxiosResponse } from 'axios';
@Injectable()
export class WalmartReportService {
  constructor(
    private readonly walmartReportClient: WalmartReportClient,
    private readonly walmartCampaignClient: WalmartCampaignClient,
    private readonly commerceDb: VendoCommerceDBService,
  ) {}

  async campaignPerformanceReport(
    brandId: number,
    advertiserId: string,
    campaignType: CampaignTypes,
    periodType: PeriodType,
    startDate: string,
    endDate: string,
  ) {
    let period_name;
    let period_function;
    let year_function;
    if (periodType == PeriodType.DAILY) {
      period_name = 'date';
      period_function = 'date(wa.date)';
      year_function = 'year(wa.date)';
    } else if (periodType == PeriodType.WEEKLY) {
      period_name = 'week';
      period_function = 'right(WalmartYearWeek(wa.date),2)';
      year_function = 'left(WalmartYearWeek(wa.date),4)';
    } else if (periodType == PeriodType.MONTHLY) {
      period_name = 'month';
      period_function = 'month(wa.date)';
      year_function = 'year(wa.date)';
    }
    const campaign_ids = await this.getCampaignIdsByType(advertiserId, campaignType);
    if (campaign_ids.length > 0) {
      const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
      with date_values as (
          select
              wa.date as raw_date,
              ${year_function} as year,
              ${period_function} as ${period_name}
          from walmart_ad_group wa
      ),
      agg_daily as (
          select
              dv.year as year,
              dv.${period_name} as ${period_name},
              sum(wa.brandAttributedSales14days + wa.directAttributedSales14days + wa.relatedAttributedSales14days) as sales,
              sum(wa.adSpend) as spend
          from walmart_ad_group wa
          join date_values dv on dv.raw_date = wa.date
          where wa.brandId = ${brandId}
          and wa.campaignId in (${campaign_ids.join(',')})
          and wa.date between '${startDate}' and '${endDate}'
          group by dv.year, dv.${period_name}
      ),
      sales_data as (
          select
              sum(p.totalSales14days) as sales,
              dv.year,
              dv.${period_name}
          from walmart_attributed_purchases p
          join date_values dv on dv.raw_date = p.date
          where p.brandId = ${brandId}
          and p.campaignId in (${campaign_ids.join(',')})
          and p.date between '${startDate}' and '${endDate}'
          group by dv.year, dv.${period_name}
      )
      select
          ag.year,
          ag.${period_name},
          ag.sales as agg_sales,
          ag.spend,
          sd.sales as sales,
          sd.sales / ag.spend as roas
      from agg_daily ag
      left join sales_data sd on ag.year = sd.year and ag.${period_name} = sd.${period_name};

      `);
      return {
        list: result,
      };
    } else {
      return {
        list: [],
      };
    }
  }

  async campaignAwarenessReport(
    brandId: number,
    advertiserId: string,
    campaignType: CampaignTypes,
    periodType: PeriodType,
    startDate: string,
    endDate: string,
  ) {
    let period_name;
    let period_function;
    let year_function;
    if (periodType == PeriodType.DAILY) {
      period_name = 'date';
      period_function = 'date(wa.date)';
      year_function = 'year(wa.date)';
    } else if (periodType == PeriodType.WEEKLY) {
      period_name = 'week';
      period_function = 'right(WalmartYearWeek(wa.date),2)';
      year_function = 'left(WalmartYearWeek(wa.date),4)';
    } else if (periodType == PeriodType.MONTHLY) {
      period_name = 'month';
      period_function = 'month(wa.date)';
      year_function = 'year(wa.date)';
    }
    const campaign_ids = await this.getCampaignIdsByType(advertiserId, campaignType);
    if (campaign_ids.length > 0) {
      const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
          with date_values as(
              select wa.date            as raw_date,
                     ${year_function}   as year,
                     ${period_function} as ${period_name}
              from walmart_ad_group wa
          )
          select dv.year                     as year,
                 dv.${period_name}           as ${period_name},
                 sum(wa.numAdsClicks)        as clicks,
                 sum(wa.numAdsShown)         as impression,
                 sum(wa.numAdsClicks) / sum(wa.numAdsShown) as ctr
          from walmart_ad_group wa
          join date_values dv on dv.raw_date = wa.date
          where wa.brandId = ${brandId} and wa.campaignId in (${campaign_ids.join(',')}) and
                wa.date between '${startDate}' and '${endDate}'
          group by dv.year, dv.${period_name}
      `);
      return {
        list: result,
      };
    } else {
      return {
        list: [],
      };
    }
  }

  async campaignEfficiencyReport(
    brandId: number,
    advertiserId: string,
    campaignType: CampaignTypes,
    periodType: PeriodType,
    startDate: string,
    endDate: string,
  ) {
    let period_name;
    let period_function;
    let year_function;
    if (periodType == PeriodType.DAILY) {
      period_name = 'date';
      period_function = 'date(wa.date)';
      year_function = 'year(wa.date)';
    } else if (periodType == PeriodType.WEEKLY) {
      period_name = 'week';
      period_function = 'right(WalmartYearWeek(wa.date),2)';
      year_function = 'left(WalmartYearWeek(wa.date),4)';
    } else if (periodType == PeriodType.MONTHLY) {
      period_name = 'month';
      period_function = 'month(wa.date)';
      year_function = 'year(wa.date)';
    }
    const campaign_ids = await this.getCampaignIdsByType(advertiserId, campaignType);
    if (campaign_ids.length > 0) {
      const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
          with date_values as(
              select wa.date                          as raw_date,
                     ${year_function}   as year,
                     ${period_function} as ${period_name}
              from walmart_ad_group wa
          )
          select dv.year                                            as year,
                 dv.${period_name}                                  as ${period_name},
                 sum(wa.adSpend)/sum(wa.numAdsClicks)               as cpc,
                 sum(wa.attributedUnits14days)/sum(wa.numAdsClicks) as cvr
          from walmart_ad_group wa
          join date_values dv on dv.raw_date = wa.date
          where wa.brandId = ${brandId} and wa.campaignId in (${campaign_ids.join(',')}) and
                wa.date between '${startDate}' and '${endDate}'
          group by dv.year, dv.${period_name}
      `);
      return {
        list: result,
      };
    } else {
      return {
        list: [],
      };
    }
  }
  async placementPlatformReport(brandId: number, startDate: string, endDate: string) {
    const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
        with agg_sales_spend as (
            select  wp.placement,
                    sum(wp.brandAttributedSales14days+
                        wp.directAttributedSales14days+
                        wp.relatedAttributedSales14days) as sales,
                    sum(adSpend)                        as spend
            from walmart_placement wp
            where wp.brandId = ${brandId} and date between '${startDate}' and '${endDate}'
            group by wp.placement
        )
        select *,
               agg.sales/agg.spend as roas
        from agg_sales_spend agg;
    `);
    return {
      list: result,
    };
  }

  async platformPerformanceReport(
    brandId: number,
    advertiserId: string,
    campaignType: CampaignTypes,
    startDate: string,
    endDate: string,
  ) {
    const campaign_ids = await this.getCampaignIdsByType(advertiserId, campaignType);
    if (campaign_ids.length > 0) {
      const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
          with agg_daily as (
              select
                  wp.platform                             as platform,
                  sum(wp.brandAttributedSales14days+
                      wp.directAttributedSales14days+
                      wp.relatedAttributedSales14days)    as sales,
                  sum(adSpend)                            as spend
              from walmart_platform wp
              where wp.brandId = ${brandId} and wp.campaignId in (${campaign_ids.join(',')}) and
                    date between '${startDate}' and '${endDate}'
              group by platform
          )
          select *,
                 ag.sales/ag.spend as roas
          from agg_daily ag;
      `);
      return {
        list: result,
      };
    } else {
      return {
        list: [],
      };
    }
  }

  async pageTypePerformanceReport(
    brandId: number,
    advertiserId: string,
    campaignType: CampaignTypes,
    startDate: string,
    endDate: string,
  ) {
    const campaign_ids = await this.getCampaignIdsByType(advertiserId, campaignType);
    if (campaign_ids.length > 0) {
      const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
          with agg_daily as (
              select
                    wp.pageType                               as platform,
                    sum(wp.brandAttributedSales14days+
                        wp.directAttributedSales14days+
                          wp.relatedAttributedSales14days) as sales,
                   sum(adSpend)                            as spend
              from walmart_page_type wp
              where wp.brandId = ${brandId} and wp.campaignId in (${campaign_ids.join(',')})and
                    date between '${startDate}' and '${endDate}'
              group by platform
          )
          select *,
                 ag.sales/ag.spend as roas
          from agg_daily ag;
      `);
      return {
        list: result,
      };
    } else {
      return {
        list: [],
      };
    }
  }

  async allCampaignChart(brandId: number, startDate: string, endDate: string) {
    const dailyData: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
with agg_daily as (select wa.date                              as date,
                          sum(wa.brandAttributedSales14days +
                              wa.directAttributedSales14days +
                              wa.relatedAttributedSales14days) as sales,
                          sum(adSpend)                         as spend,
                          sum(numAdsClicks)                    as clicks,
                          sum(numAdsShown)                     as impression,
                          sum(attributedUnits14days)           as sales_units,
                          sum(attributedOrders14days)          as orders,
                          sum(ntbRevenue14days)                as new_to_brand_sales,
                          sum(ntbUnits14days)                  as new_to_brand_units,
                          sum(ntbOrders14days)                 as new_to_brand_orders
                   from walmart_ad_group wa
                   where wa.brandId = ${brandId}
                     and date between '${startDate}' and '${endDate}'
                   group by date),
     sales_data as (select p.date                  as date,
                           sum(p.totalSales14days) as total_sales
                    from walmart_attributed_purchases p
                    where p.brandId = ${brandId}
                      and p.date between '${startDate}' and '${endDate}'
                    group by p.date)
select *,
       sales.total_sales            as sales,
       sales.total_sales / ag.spend as roas,
       ag.clicks / ag.impression    as ctr,
       ag.spend / ag.clicks         as cpc,
       ag.spend / ag.clicks         as cpc,
       ag.sales_units / ag.clicks   as cvr,
       ag.spend / sales.total_sales as acos
from agg_daily ag
         left join sales_data as sales
                   on sales.date = ag.date;
    `);
    const totalData = {};
    for (const dayData of dailyData) {
      for (const metricKey in dayData) {
        if (metricKey != 'date') {
          dayData[metricKey] = +dayData[metricKey];
          if (metricKey in totalData) {
            totalData[metricKey] += dayData[metricKey];
          } else {
            totalData[metricKey] = dayData[metricKey];
          }
        }
      }
    }
    totalData['roas'] = totalData['sales'] / totalData['spend'];
    totalData['cvr'] = (totalData['orders'] / totalData['clicks']) * 100;
    return {
      daily_data: dailyData,
      total: totalData,
    };
  }
  async getCampaignIdsByType(advertiserId: string, campaignType: CampaignTypes) {
    const campaignList = await this.walmartCampaignClient.createClient(advertiserId).walmartCampaignListCreate({
      data: {
        advertiser_id: +advertiserId,
      },
    });
    const campaignTypeEnumMap = {
      sponsoredProducts: CampaignTypes.SPONSORED_PRODUCTS,
      sba: CampaignTypes.SPONSORED_BRANDS,
      video: CampaignTypes.SPONSORED_VIDEO,
    };
    return campaignList.data
      .filter((obj) => campaignTypeEnumMap[obj.campaign_type] === campaignType)
      .map((obj) => obj.campaign_id);
  }
  async adsReportLog(data: AdReportsLogsReq, brandId: number) {
    const response = await this.walmartReportClient.createClient(brandId).walmartAdsReportsLogsList({
      brandId,
      ...data,
    });
    return response.data;
  }
  async getKeywordWeekly({ year, week, brandId }: { year: number[]; week: number[]; brandId: number }) {
    const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
      select
          left(WalmartYearWeek(date),4) as year,
          right(WalmartYearWeek(date),2) as week,
          sum(ntbUnits14days) as ntbUnits14days,
          sum(ntbOrders14days) as ntbOrders14days,
          sum(ntbRevenue14days) as ntbRevenue14days,
          sum(bid) as bid,
          sum(numAdsShown) as numAdsShown,
          sum(numAdsClicks) as numAdsClicks,
          sum(adSpend) as adSpend,
          sum(directAttributedSales14days) as directAttributedSales14days,
          sum(advertisedSkuSales14days) as advertisedSkuSales14days,
          sum(attributedUnits14days) as attributedUnits14days,
          sum(brandAttributedSales14days) as brandAttributedSales14days,
          sum(relatedAttributedSales14days) as relatedAttributedSales14days,
          sum(otherSkuSales14days) as otherSkuSales14days,
          sum(attributedOrders14days) as attributedOrders14days
      from vendo_commerce.walmart_keyword
      where week(date) in (${week.join(',')}) and left(WalmartYearWeek(date),4) in (${year.join(
      ',',
    )}) and brandId = ${brandId}
      group by WalmartYearWeek(date)
      order by WalmartYearWeek(date)
    `);
    return {
      list: result,
    };
  }

  async getAdItemWeekly({ year, week, brandId }: { year: number[]; week: number[]; brandId: number }) {
    const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
      select
          left(WalmartYearWeek(date),4) as year,
          right(WalmartYearWeek(date),2) as week,
          sum(numAdsShown) as numAdsShown,
          sum(numAdsClicks) as numAdsClicks,
          sum(adSpend) as adSpend,
          sum(directAttributedSales14days) as directAttributedSales14days,
          sum(advertisedSkuSales14days) as advertisedSkuSales14days,
          sum(attributedUnits14days) as attributedUnits14days,
          sum(attributedOrders14days) as attributedOrders14days,
          sum(brandAttributedSales14days) as brandAttributedSales14days,
          sum(relatedAttributedSales14days) as relatedAttributedSales14days,
          sum(otherSkuSales14days) as otherSkuSales14days
      from vendo_commerce.walmart_ad_item
      where right(WalmartYearWeek(date),2) in (${week.join(',')}) and left(WalmartYearWeek(date),4) in (${year.join(
      ',',
    )}) and brandId = ${brandId}
      group by WalmartYearWeek(date)
      order by WalmartYearWeek(date)
    `);
    return {
      list: result,
    };
  }

  async getAdGroupWeekly({ year, week, brandId }: { year: number[]; week: number[]; brandId: number }) {
    const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
        select left(WalmartYearWeek(date),4)                        as year,
               right(WalmartYearWeek(date),2)                        as week,
               sum(ntbUnits14days)               as ntbUnits14days,
               sum(ntbOrders14days)              as ntbOrders14days,
               sum(ntbRevenue14days)             as ntbRevenue14days,
               sum(numAdsShown)                  as numAdsShown,
               sum(numAdsClicks)                 as numAdsClicks,
               sum(adSpend)                      as adSpend,
               sum(directAttributedSales14days)  as directAttributedSales14days,
               sum(attributedUnits14days)        as attributedUnits14days,
               sum(brandAttributedSales14days)   as brandAttributedSales14days,
               sum(relatedAttributedSales14days) as relatedAttributedSales14days,
               sum(attributedOrders14days)       as attributedOrders14days
        from vendo_commerce.walmart_ad_group
        where right(WalmartYearWeek(date),2) in (${week.join(',')})
          and left(WalmartYearWeek(date),4) in (${year.join(',')})
          and brandId = ${brandId}
        group by WalmartYearWeek(date)
        order by WalmartYearWeek(date)
    `);
    return {
      list: result,
    };
  }

  async getKeywordMetrics({
    brandId,
    startDate,
    endDate,
    advertiserId,
    search,
    groupBy,
    groupByRange,
  }: {
    brandId: number;
    startDate: string;
    endDate: string;
    advertiserId: string;
    search: string;
    groupBy: KeywordGroupByTypes;
    groupByRange: AdItemGroupByRange;
  }) {
    let searchClause = '';
    let groupByClause = '';
    if (groupBy == KeywordGroupByTypes.KEYWORD) {
      groupByClause = `keywordId`;
    } else if (groupBy == KeywordGroupByTypes.AD_GROUP) {
      groupByClause = 'keywordId,adGroupId';
    } else if (groupBy == KeywordGroupByTypes.CAMPAIGN) {
      groupByClause = 'keywordId,campaignId';
    }
    let periodSelectClause = '';
    if (groupByRange == AdItemGroupByRange.TOTAL) {
      periodSelectClause = '';
    } else if (groupByRange == AdItemGroupByRange.DATE) {
      groupByClause += ',date';
      periodSelectClause = `
        ,date as date
      `;
    } else if (groupByRange == AdItemGroupByRange.MONTH) {
      groupByClause += ',year(date),month(date)';
      periodSelectClause = `
        ,year(date)  as year,
        month(date) as month
      `;
    } else if (groupByRange == AdItemGroupByRange.WEEK) {
      groupByClause += ',WalmartYearWeek(date)';
      periodSelectClause = `
        ,left(WalmartYearWeek(date),4)  as year,
        right(WalmartYearWeek(date),2) as week
      `;
    } else if (groupByRange == AdItemGroupByRange.YEAR) {
      groupByClause += ',year(date)';
      periodSelectClause = `
        ,year(date)  as year
      `;
    }
    if (search && search != '') {
      searchClause = `and (keywordId like '%${search}%' or lower(searchedKeyword) like lower('%${search}%') or
      lower(biddedKeyword) like lower('%${search}%'))`;
    }
    const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
      select
          keywordId             as keywordId,
          min(searchedKeyword)  as searchedKeyword,
          min(biddedKeyword)    as biddedKeyword,
          min(matchType)        as matchType,
          min(adGroupId)        as adGroupId,
          sum(ntbUnits14days)   as ntbUnits14days,
          sum(ntbOrders14days)  as ntbOrders14days,
          sum(ntbRevenue14days) as ntbRevenue14days,
          sum(bid) as bid,
          sum(numAdsShown) as numAdsShown,
          sum(numAdsClicks) as numAdsClicks,
          sum(adSpend) as adSpend,
          sum(directAttributedSales14days) as directAttributedSales14days,
          sum(advertisedSkuSales14days) as advertisedSkuSales14days,
          sum(attributedUnits14days) as attributedUnits14days,
          sum(brandAttributedSales14days) as brandAttributedSales14days,
          sum(relatedAttributedSales14days) as relatedAttributedSales14days,
          sum(otherSkuSales14days) as otherSkuSales14days,
          sum(attributedOrders14days) as attributedOrders14days
          ${periodSelectClause}
      from vendo_commerce.walmart_keyword
      where brandId = ${brandId} and date between '${startDate}' and '${endDate}' ${searchClause}
      group by ${groupByClause}
      order by ${groupByClause}
    `);
    const adGroups = await this.walmartCampaignClient.createClient(advertiserId).walmartCampaignAdGroupListCreate({
      advertiserId: advertiserId,
      data: {},
    });
    const campaigns = await this.walmartCampaignClient.createClient(advertiserId).walmartCampaignListCreate({
      data: { advertiser_id: +advertiserId },
    });
    const campaignsMap = campaigns.data.reduce((map, campaign) => {
      map[campaign['campaign_id']] = campaign;
      return map;
    }, {});
    const adGroupMap = adGroups.data.reduce((map, adgroup) => {
      map[adgroup['ad_group_id']] = adgroup;
      return map;
    }, {});
    for (const keywordMetrics of result) {
      const adGroupData = adGroupMap[keywordMetrics['adGroupId']];
      const campaignData = campaignsMap[adGroupData['campaign_id']];
      keywordMetrics['adGroupData'] = adGroupData;
      keywordMetrics['campaignData'] = campaignData;
    }
    return {
      list: result,
    };
  }

  async getAdItemMetrics({
    brandId,
    startDate,
    endDate,
    advertiserId,
    search,
    groupBy,
    groupByRange,
    include = [],
  }: {
    brandId: number;
    startDate: string;
    endDate: string;
    advertiserId: string;
    search: string;
    groupBy: AdItemGroupByTypes;
    groupByRange: AdItemGroupByRange;
    include: AdItemIncludeEnum[];
  }) {
    try {
      let groupByClause = '';
      if (groupBy == AdItemGroupByTypes.ITEM) {
        groupByClause = `itemId`;
      } else if (groupBy == AdItemGroupByTypes.AD_GROUP) {
        groupByClause = 'itemId,adGroupId';
      } else if (groupBy == AdItemGroupByTypes.CAMPAIGN) {
        groupByClause = 'itemId,campaignId';
      }
      let periodSelectClause = '';
      if (groupByRange == AdItemGroupByRange.TOTAL) {
        periodSelectClause = '';
      } else if (groupByRange == AdItemGroupByRange.DATE) {
        groupByClause += ',date';
        periodSelectClause = `
        ,date as date
      `;
      } else if (groupByRange == AdItemGroupByRange.MONTH) {
        groupByClause += ',year(date),month(date)';
        periodSelectClause = `
        ,year(date)  as year,
        month(date) as month
      `;
      } else if (groupByRange == AdItemGroupByRange.WEEK) {
        groupByClause += ',WalmartYearWeek(date)';
        periodSelectClause = `
        ,left(WalmartYearWeek(date),4)  as year,
        right(WalmartYearWeek(date),2) as week
      `;
      } else if (groupByRange == AdItemGroupByRange.YEAR) {
        groupByClause += ',year(date)';
        periodSelectClause = `
        ,year(date)  as year
      `;
      }
      const query = `
      select
          itemId,
          group_concat(distinct adGroupId) as adGroupIds,
          group_concat(distinct campaignId) as campaignIds,
          min(itemName) as itemName,
          min(itemImage) as itemImage,
          sum(numAdsShown) as numAdsShown,
          sum(numAdsClicks) as numAdsClicks,
          sum(adSpend) as adSpend,
          sum(directAttributedSales14days) as directAttributedSales14days,
          sum(advertisedSkuSales14days) as advertisedSkuSales14days,
          sum(attributedUnits14days) as attributedUnits14days,
          sum(attributedOrders14days) as attributedOrders14days,
          sum(brandAttributedSales14days) as brandAttributedSales14days,
          sum(relatedAttributedSales14days) as relatedAttributedSales14days,
          sum(otherSkuSales14days) as otherSkuSales14days
          ${periodSelectClause}
      from vendo_commerce.walmart_ad_item
      where brandId = ${brandId} and date between '${startDate}' and '${endDate}'
      group by ${groupByClause}
      order by ${groupByClause}
    `;
      const result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(query);
      const adGroups = await this.walmartCampaignClient.createClient(advertiserId).walmartCampaignAdGroupListCreate({
        advertiserId: advertiserId,
        data: {},
      });
      const campaigns = await this.walmartCampaignClient.createClient(advertiserId).walmartCampaignListCreate({
        data: { advertiser_id: +advertiserId },
      });
      const campaignsMap = campaigns.data.reduce((map, campaign) => {
        map[campaign['campaign_id']] = campaign;
        return map;
      }, {});
      const adGroupMap = adGroups.data.reduce((map, adgroup) => {
        map[adgroup['ad_group_id']] = adgroup;
        return map;
      }, {});
      const campaignIds = _.uniqBy(result, 'campaignIds').map((item) => item['campaignIds']);
      let adItems: CampaignAdItemList[][] = [];
      let SearchItem: AxiosResponse<SearchItem[], any> = {} as AxiosResponse<SearchItem[], any>;

      if (groupBy == AdItemGroupByTypes.AD_GROUP) {
        try {
          if (include.includes(AdItemIncludeEnum.BID)) {
            SearchItem = await this.walmartCampaignClient.createClient(advertiserId).walmartCampaignItemsSearchRead({
              advertiserId: advertiserId,
              searchText: ' ',
            });
          }
        } catch (e) {
          console.log(e);
        }
        if (include.includes(AdItemIncludeEnum.ADITEM)) {
          adItems = await Promise.all(
            campaignIds.map(async (campaignId) => {
              const adItems = await this.walmartCampaignClient
                .createClient(advertiserId)
                .walmartCampaignAdItemListRead({
                  campaignId: campaignId,
                  advertiserId: advertiserId,
                });
              return adItems.data;
            }),
          );
        }
      }
      for (const adItemGroupMetrics of result) {
        const adItem = _.chain(adItems)
          .flatten()
          .filter(
            (item) =>
              +item.ad_group_id === +adItemGroupMetrics.adGroupIds &&
              +item.item_id === +adItemGroupMetrics.itemId &&
              +item.campaign_id === +adItemGroupMetrics.campaignIds,
          )
          .value();
        const bidSuggestionMap = _.chain(SearchItem.data)
          .flatten()
          .filter((item) => +item.item_id === +adItemGroupMetrics.itemId)
          .value();

        const adGroupIds = adItemGroupMetrics['adGroupIds'].split(',');
        const campaignIds = adItemGroupMetrics['campaignIds'].split(',');
        if (groupBy == AdItemGroupByTypes.AD_GROUP) {
          adItemGroupMetrics['adItemsList'] = adItem;
          adItemGroupMetrics['bidSuggestionList'] = bidSuggestionMap;
        }
        adItemGroupMetrics['adGroupsList'] = adGroupIds.reduce((list, adGroupId) => {
          list.push(adGroupMap[adGroupId]);
          return list;
        }, []);
        adItemGroupMetrics['campaignsList'] = campaignIds.reduce((list, campaignId) => {
          list.push(campaignsMap[campaignId]);
          return list;
        }, []);
      }
      let searchResult = result;
      if (search && search != '') {
        searchResult = result.filter((obj) =>
          Object.values(obj).some((value) => {
            if (Array.isArray(value)) {
              return value.some((obj1) =>
                Object.values(obj1).some((item) => String(item).toLowerCase().includes(search.toLowerCase())),
              );
            } else {
              return String(value).toLowerCase().includes(search.toLowerCase());
            }
          }),
        );
      }
      return {
        list: searchResult,
      };
    } catch (e) {
      console.log(e);
    }
  }

  async getAdGroupMetrics({
    brandId,
    startDate,
    endDate,
    advertiserId,
    search = '',
    groupBy,
    groupByRange,
  }: {
    brandId: number;
    startDate: string;
    endDate: string;
    advertiserId: string;
    search: string;
    groupBy: AdItemGroupByTypes;
    groupByRange: AdItemGroupByRange;
  }) {
    let groupByClause = '';
    if (groupBy == AdItemGroupByTypes.AD_GROUP) {
      groupByClause = `adGroupId`;
    } else if (groupBy == AdItemGroupByTypes.CAMPAIGN) {
      groupByClause = 'adGroupId,campaignId';
    }
    let periodSelectClause = '';
    if (groupByRange == AdItemGroupByRange.TOTAL) {
      periodSelectClause = '';
    } else if (groupByRange == AdItemGroupByRange.DATE) {
      groupByClause += ',date';
      periodSelectClause = `
        ,date as date
      `;
    } else if (groupByRange == AdItemGroupByRange.MONTH) {
      groupByClause += ',year(date),month(date)';
      periodSelectClause = `
        ,year(date)  as year,
        month(date) as month
      `;
    } else if (groupByRange == AdItemGroupByRange.WEEK) {
      groupByClause += ',WalmartYearWeek(date)';
      periodSelectClause = `
        ,left(WalmartYearWeek(date),4)  as year,
        right(WalmartYearWeek(date),2) as week
      `;
    } else if (groupByRange == AdItemGroupByRange.YEAR) {
      groupByClause += ',year(date)';
      periodSelectClause = `
        ,year(date)  as year
      `;
    }
    let result: Record<string, any>[] = await this.commerceDb.$queryRawUnsafe(`
        select adGroupId                         as adGroupId,
               sum(ntbUnits14days)               as ntbUnits14days,
               sum(ntbOrders14days)              as ntbOrders14days,
               sum(ntbRevenue14days)             as ntbRevenue14days,
               sum(numAdsShown)                  as numAdsShown,
               sum(numAdsClicks)                 as numAdsClicks,
               sum(adSpend)                      as adSpend,
               sum(directAttributedSales14days)  as directAttributedSales14days,
               sum(attributedUnits14days)        as attributedUnits14days,
               sum(brandAttributedSales14days)   as brandAttributedSales14days,
               sum(relatedAttributedSales14days) as relatedAttributedSales14days,
               sum(attributedOrders14days)       as attributedOrders14days
               ${periodSelectClause}

        from vendo_commerce.walmart_ad_group
        where brandId = ${brandId} and date between '${startDate}' and '${endDate}'
        group by ${groupByClause}
        order by ${groupByClause}
    `);
    const adGroups = await this.walmartCampaignClient.createClient(advertiserId).walmartCampaignAdGroupListCreate({
      advertiserId: advertiserId,
      data: {},
    });
    const campaigns = await this.walmartCampaignClient.createClient(advertiserId).walmartCampaignListCreate({
      data: { advertiser_id: +advertiserId },
    });
    const campaignsMap = campaigns.data.reduce((map, campaign) => {
      map[campaign['campaign_id']] = campaign;
      return map;
    }, {});
    const adGroupMap = adGroups.data.reduce((map, adgroup) => {
      map[adgroup['ad_group_id']] = adgroup;
      return map;
    }, {});
    for (const adGroupMetrics of result) {
      const adGroupData = adGroupMap[adGroupMetrics['adGroupId']];
      const campaignData = campaignsMap[adGroupData?.campaign_id || ''];
      adGroupMetrics['adGroupData'] = adGroupData;
      adGroupMetrics['campaignData'] = campaignData;
    }
    result = result.filter(
      (item) =>
        item?.adGroupData?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item?.adGroupData?.ad_group_id?.toString().includes(search),
    );
    return {
      list: result,
    };
  }
}
