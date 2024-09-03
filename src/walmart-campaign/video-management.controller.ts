import { Controller, Post, Body, UseGuards, UseInterceptors, UseFilters, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import {
  MediaDeleteReq,
  UpdateCaptionReq,
  UpdateMediaReq,
  UploadCompleteReq,
  VideoUploadReq,
} from '../walmart-communicator';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { VideoManagementService } from './video-management.service';
import { Pagination, PaginationInterceptor, PaginationOptions } from '../middlewares/pagination.middleware';
import { GetVideoListArgs } from './dto/video-list';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@Controller('brands/:brandId/video-management')
export class VideoManagementController {
  constructor(private readonly videoManagementService: VideoManagementService) {}

  @Post('/list')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseInterceptors(PaginationInterceptor)
  @UseFilters(WalmartExceptionFilter)
  list(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Body() data: GetVideoListArgs,
    @Pagination() pagination: PaginationOptions,
  ) {
    return this.videoManagementService.listMedia(data, config.advertiser_id, pagination);
  }

  @Get('/create-link')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  createUploadLink(@ExtractWalmartConfig() config: WalmartConfig) {
    return this.videoManagementService.createUploadLink(config.advertiser_id);
  }

  @Post('/upload')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  uploadMedia(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: VideoUploadReq) {
    return this.videoManagementService.uploadMedia(data, config.advertiser_id);
  }

  @Post('/complete-upload')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  completeUpload(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: UploadCompleteReq) {
    return this.videoManagementService.completeMediaUpload(data, config.advertiser_id);
  }

  @Post('/update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: UpdateMediaReq) {
    return this.videoManagementService.updateMedia(data, config.advertiser_id);
  }

  @Post('/caption-update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  updateCaption(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: UpdateCaptionReq) {
    return this.videoManagementService.updateMediaCaption(data, config.advertiser_id);
  }

  @Post('/delete')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  delete(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: MediaDeleteReq) {
    return this.videoManagementService.deleteMedia(data, config.advertiser_id);
  }
}
