import { Injectable } from '@nestjs/common';
import {
  MediaDeleteReq,
  UpdateCaptionReq,
  UpdateMediaReq,
  UploadCompleteReq,
  VideoUploadReq,
} from '../walmart-communicator';
import { WalmartClient } from './walmart-client.service';
import { PaginationOptions } from '../middlewares/pagination.middleware';
import { GetVideoListArgs } from './dto/video-list';

@Injectable()
export class VideoManagementService {
  constructor(private readonly walmartClient: WalmartClient) {}

  async listMedia(data: GetVideoListArgs, advertiserId: string, pagination: PaginationOptions) {
    const body = {
      media_id: data.media_id,
      status: data.status,
    };
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignVideoManagementListCreate({
      data: body,
      advertiserId: advertiserId,
    });
    const { page, limit } = pagination;
    let filteredMedias = response.data;
    if (data.name_filter != null && data.name_filter != '') {
      filteredMedias = filteredMedias.filter((media) =>
        media.name.toLowerCase().includes(data.name_filter.toLowerCase()),
      );
    }
    const pageMedias = filteredMedias.slice((page - 1) * limit, page * limit);
    return { items: pageMedias, page, limit, count: filteredMedias.length };
  }
  async createUploadLink(advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignVideoManagementCreate({
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async uploadMedia(data: VideoUploadReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignVideoManagementUploadCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async completeMediaUpload(data: UploadCompleteReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignVideoManagementCompleteCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async updateMedia(data: UpdateMediaReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignVideoManagementUpdateCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async updateMediaCaption(data: UpdateCaptionReq, advertiserId: string) {
    const response = await this.walmartClient
      .createClient(advertiserId)
      .walmartCampaignVideoManagementUpdateCaptionCreate({
        data: data,
        advertiserId: advertiserId,
      });
    return response.data;
  }
  async deleteMedia(data: MediaDeleteReq, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignVideoManagementDeleteCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
}
