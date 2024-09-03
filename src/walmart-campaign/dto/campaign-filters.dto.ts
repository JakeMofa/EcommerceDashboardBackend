import { UpdateCampaignArgs } from 'src/walmart-communicator';

export enum CampaignFilterRule {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
}
export enum CampaignFilterName {
  CAMPAIGN_TYPE = 'campaign_type',
  TARGETING_TYPE = 'targeting_type',
  STATUS = 'status',
  BUDGET_TYPE = 'budget_type',
  START_DATE = 'start_date',
  END_DATE = 'end_date',
  TOTAL_BUDGET = 'total_budget',
  DAILY_BUDGET = 'daily_budget',
  ROLLOVER = 'rollover',
}
interface CampaignFilter {
  property_name: CampaignFilterName;
  rule: CampaignFilterRule;
  value: string;
}
class CampaignFiltersArgs {
  /**
   *
   * @type {number}
   * @memberof CampaignListFilter
   */
  'campaign_id'?: number;
  /**
   *
   * @type {number}
   * @memberof CampaignListFilter
   */
  'advertiser_id': number;
  /**
   *
   * @type {string}
   * @memberof CampaignListFilter
   */
  'filter_name'?: string;
  /**
   *
   * @type {string}
   * @memberof CampaignListFilter
   */
  'filter_last_modified_at'?: string;
  /**
   *
   * @type {CampaignFilter[]}
   * @memberof CampaignListFilter
   */
  'custom_filters': CampaignFilter[];
}
export interface BulkUpdateCampaignArgs {
  campaigns: Array<UpdateCampaignArgs>;
}
export type UpdateCampaignByTagReq = UpdateCampaignArgs;
export { CampaignFiltersArgs };
