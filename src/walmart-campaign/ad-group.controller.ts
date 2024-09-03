import { Controller, Post, Body, UseGuards, UseInterceptors, Put, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { AdGroupService } from './ad-group.service';
import { CreateAdGroupReq, ListAdGroupArgs, UpdateAdGroupReq } from '../walmart-communicator';
import {
  ApiPagination,
  Pagination,
  PaginationInterceptor,
  PaginationOptions,
} from '../middlewares/pagination.middleware';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@Controller('brands/:brandId/walmart-ad-group')
export class AdGroupController {
  constructor(private readonly adGroupService: AdGroupService) {}

  @Post('/create')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  create(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: CreateAdGroupReq) {
    return this.adGroupService.create(data, config.advertiser_id);
  }

  @Post('/get')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @ApiPagination()
  @UseInterceptors(PaginationInterceptor)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  findAll(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Body() data: ListAdGroupArgs,
    @Pagination() pagination: PaginationOptions,
  ) {
    return this.adGroupService.getAdGroups(data, pagination, config.advertiser_id);
  }

  @Put('/update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() updateAdGroupReq: UpdateAdGroupReq) {
    return this.adGroupService.update(updateAdGroupReq, config.advertiser_id);
  }
}
