import { Controller, Post, Body, UseGuards, UseInterceptors, Put, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { SPAReviewCancelReq, SPAReviewSubmitReq } from '../walmart-communicator';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { SponsoredBrandReviewService } from './sponsored-brand-review.service';
import { SponsoredBrandReviewDto } from './dto/sponsored-brand-review.dto';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@Controller('brands/:brandId/sponsored-brand-review')
export class SponsoredBrandReviewController {
  constructor(private readonly reviewService: SponsoredBrandReviewService) {}

  @Post('/get')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  list(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: SponsoredBrandReviewDto) {
    return this.reviewService.listBrandReviews(data, config.advertiser_id);
  }

  @Post('/submit')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  create(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: SPAReviewSubmitReq) {
    return this.reviewService.submitReview(data, config.advertiser_id);
  }

  @Put('/cancel')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: SPAReviewCancelReq) {
    return this.reviewService.cancelReview(data, config.advertiser_id);
  }
}
