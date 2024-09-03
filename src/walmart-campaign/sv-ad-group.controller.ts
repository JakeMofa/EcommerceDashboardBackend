import { Controller, Post, Body, UseGuards, UseInterceptors, Put, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { CreateSVAdGroupArgs, ListSVAdGroupArgs, UpdateSVAdGroupArgs } from '../walmart-communicator';
import {
  ApiPagination,
  Pagination,
  PaginationInterceptor,
  PaginationOptions,
} from '../middlewares/pagination.middleware';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { SVAdGroupService } from './sv-ad-group.service';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@Controller('brands/:brandId/walmart-sv-ad-group')
export class SVAdGroupController {
  constructor(private readonly svAdGroupService: SVAdGroupService) {}

  @Post('/create')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  create(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: CreateSVAdGroupArgs[]) {
    return this.svAdGroupService.create(data, config.advertiser_id);
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
    @Body() data: ListSVAdGroupArgs,
    @Pagination() pagination: PaginationOptions,
  ) {
    return this.svAdGroupService.getSVAdGroups(data, pagination, config.advertiser_id);
  }

  @Put('/update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() updateSVAdGroupReq: UpdateSVAdGroupArgs[]) {
    return this.svAdGroupService.update(updateSVAdGroupReq, config.advertiser_id);
  }
}
