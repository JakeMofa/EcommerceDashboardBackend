import { Controller, Post, Body, UseGuards, UseInterceptors, Put, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { CampaignApiService } from './campaign.service';
import { CreateCampaignReq, DeleteCampaignReq, UpdateCampaignReq } from '../walmart-communicator';
import {
  ApiPagination,
  Pagination,
  PaginationInterceptor,
  PaginationOptions,
} from '../middlewares/pagination.middleware';
import { SearchCampaignItemsArgs } from './dto/campaign-items.dto';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { GetStatsArgs } from './dto/stats.dto';
import { BulkUpdateCampaignArgs, CampaignFiltersArgs } from './dto/campaign-filters.dto';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('brands/:brandId/walmart-campaign')
export class CampaignController {
  constructor(private readonly configs: ConfigService, private readonly walmartCampaignService: CampaignApiService) {}

  @Post('/create')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  create(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: CreateCampaignReq) {
    return this.walmartCampaignService.create(data, config.advertiser_id);
  }

  @Post('/get')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @ApiPagination()
  @UseInterceptors(PaginationInterceptor)
  findAll(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Body() data: CampaignFiltersArgs,
    @Pagination() pagination: PaginationOptions,
  ) {
    return this.walmartCampaignService.getCampaign(data, pagination, config.advertiser_id);
  }

  @Post('/search-item')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @ApiPagination()
  @UseInterceptors(PaginationInterceptor)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  searchCampaignItems(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Body() data: SearchCampaignItemsArgs,
    @Pagination() pagination: PaginationOptions,
  ) {
    return this.walmartCampaignService.searchCampaignItems(data, pagination, config.advertiser_id);
  }

  @Put('/update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() updateCampaignReq: UpdateCampaignReq) {
    return this.walmartCampaignService.update(updateCampaignReq, config.advertiser_id);
  }

  @Put('/bulk-update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  bulkUpdate(@ExtractWalmartConfig() config: WalmartConfig, @Body() updateCampaignReq: BulkUpdateCampaignArgs) {
    return this.walmartCampaignService.bulkUpdate(updateCampaignReq, config.advertiser_id);
  }

  @Post('/delete')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  remove(@ExtractWalmartConfig() config: WalmartConfig, @Body() deleteCampaignReq: DeleteCampaignReq) {
    return this.walmartCampaignService.remove(deleteCampaignReq, config.advertiser_id);
  }

  @Post('/stats')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  stats(@ExtractWalmartConfig() config: WalmartConfig, @Body() statsArgs: GetStatsArgs) {
    return this.walmartCampaignService.stats(statsArgs, config.advertiser_id);
  }
}
