import { WalmartAdsReportsLogsListStatusEnum, WalmartAdsReportsLogsListTypeEnum } from '../../walmart-communicator';

export class AdReportsLogsReq {
  /**
   * type
   * @type {'CAMPAIGN_AD_GROUP' | 'CAMPAIGN_KEYWORD' | 'CAMPAIGN_AD_ITEM'}
   * @memberof WalmartAdsReportsApiWalmartAdsReportsLogsList
   */
  readonly type?: WalmartAdsReportsLogsListTypeEnum;

  /**
   * status
   * @type {'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'}
   * @memberof WalmartAdsReportsApiWalmartAdsReportsLogsList
   */
  readonly status?: WalmartAdsReportsLogsListStatusEnum;

  /**
   * A search term.
   * @type {string}
   * @memberof WalmartAdsReportsApiWalmartAdsReportsLogsList
   */
  readonly search?: string;

  /**
   * Which field to use when ordering the results.
   * @type {string}
   * @memberof WalmartAdsReportsApiWalmartAdsReportsLogsList
   */
  readonly ordering?: string;

  /**
   * A page number within the paginated result set.
   * @type {number}
   * @memberof WalmartAdsReportsApiWalmartAdsReportsLogsList
   */
  readonly page?: number;

  /**
   * Number of results to return per page.
   * @type {number}
   * @memberof WalmartAdsReportsApiWalmartAdsReportsLogsList
   */
  readonly pageSize?: number;
}
