import { Injectable } from '@nestjs/common';
import {
  CreateSponsoredBrandRequest,
  ListSponsoredBrandRequest,
  UpdateSponsoredBrandRequest,
  UploadSponsoredBrandLogoRequest,
} from '../walmart-communicator';
import { WalmartClient } from './walmart-client.service';

@Injectable()
export class SponsoredBrandService {
  constructor(private readonly walmartClient: WalmartClient) {}

  async listSponsoredBrand(data: ListSponsoredBrandRequest, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignSponsoredBrandCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async create(data: CreateSponsoredBrandRequest[], advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignSponsoredBrandCreateCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async uploadLogo(data: UploadSponsoredBrandLogoRequest, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignSponsoredBrandUploadCreate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }

  async update(data: UpdateSponsoredBrandRequest, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignSponsoredBrandUpdateUpdate({
      data: data,
      advertiserId: advertiserId,
    });
    return response.data;
  }
}
