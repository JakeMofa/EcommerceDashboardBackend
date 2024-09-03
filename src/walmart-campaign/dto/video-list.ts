import { GetMediaReqStatusEnum } from '../../walmart-communicator';

export class GetVideoListArgs {
  /**
   *
   * @type {string}
   * @memberof GetVideoListArgs
   */
  'media_id': string;
  /**
   *
   * @type {string}
   * @memberof GetVideoListArgs
   */
  'name_filter': string;
  /**
   *
   * @type {GetMediaReqStatusEnum}
   * @memberof GetStatsArgs
   */
  'status': GetMediaReqStatusEnum;
}
