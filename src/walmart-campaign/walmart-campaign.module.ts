import { Module } from '@nestjs/common';
import { CampaignApiService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseBrandModule, DatabaseCommerceModule } from '../brands/database.service';
import { AdGroupController } from './ad-group.controller';
import { KeywordsController } from './keywords.controller';
import { AdGroupService } from './ad-group.service';
import { AdItemService } from './ad-item.service';
import { KeywordsService } from './keywords.service';
import { AdItemController } from './ad-item.controller';
import { BrandsService } from '../brands/brands.service';
import { BidPlatformController } from './bid-platform.controller';
import { BidPlacementController } from './bid-placement.controller';
import { BidPlacementService } from './bid-placement.service';
import { BidPlatformService } from './bid-platform.service';
import { SponsoredBrandService } from './sponsored-brand.service';
import { SponsoredBrandController } from './sponsored-brand.controller';
import { WalmartClient } from './walmart-client.service';
import { AdPlacementController } from './ad-placement.controller';
import { AdPlacementService } from './ad-placement.service';
import { SponsoredBrandReviewController } from './sponsored-brand-review.controller';
import { SponsoredBrandReviewService } from './sponsored-brand-review.service';
import { VideoManagementController } from './video-management.controller';
import { VideoManagementService } from './video-management.service';
import { SVAdGroupController } from './sv-ad-group.controller';
import { SVAdGroupService } from './sv-ad-group.service';
import { CaslModule } from 'src/casl/casl.module';
@Module({
  imports: [CaslModule, DatabaseBrandModule, DatabaseCommerceModule, ConfigModule],
  controllers: [
    CampaignController,
    AdGroupController,
    AdItemController,
    KeywordsController,
    BidPlatformController,
    BidPlacementController,
    SponsoredBrandController,
    AdPlacementController,
    SponsoredBrandReviewController,
    VideoManagementController,
    VideoManagementController,
    SVAdGroupController,
  ],
  providers: [
    CampaignApiService,
    AdGroupService,
    AdItemService,
    KeywordsService,
    BrandsService,
    BidPlacementService,
    BidPlatformService,
    SponsoredBrandService,
    AdPlacementService,
    SponsoredBrandReviewService,
    VideoManagementService,
    SVAdGroupService,
    WalmartClient,
  ],
  exports: [CampaignApiService],
})
export class WalmartCampaignModule {}
