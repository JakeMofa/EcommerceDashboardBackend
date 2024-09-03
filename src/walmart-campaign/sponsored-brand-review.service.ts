import { Injectable } from '@nestjs/common';
import { SPAReviewCancelReq, SPAReviewSubmitReq } from '../walmart-communicator';
import { WalmartClient } from './walmart-client.service';
import { SponsoredBrandReviewDto } from './dto/sponsored-brand-review.dto';

@Injectable()
export class SponsoredBrandReviewService {
  constructor(private readonly walmartClient: WalmartClient) {}

  async listBrandReviews(data: SponsoredBrandReviewDto, advertiserId: string) {
    const response = await this.walmartClient.createClient(advertiserId).walmartCampaignSponsoredBrandReviewListRead({
      adGroupId: data.ad_group_id,
      advertiserId: advertiserId,
    });
    return response.data;
  }
  async submitReview(data: SPAReviewSubmitReq, advertiserId: string) {
    const response = await this.walmartClient
      .createClient(advertiserId)
      .walmartCampaignSponsoredBrandReviewSubmitCreate({
        data: data,
        advertiserId: advertiserId,
      });
    return response.data;
  }
  async cancelReview(data: SPAReviewCancelReq, advertiserId: string) {
    const response = await this.walmartClient
      .createClient(advertiserId)
      .walmartCampaignSponsoredBrandReviewCancelUpdate({
        data: data,
        advertiserId: advertiserId,
      });
    return response.data;
  }
}
