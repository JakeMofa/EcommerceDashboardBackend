import { Controller, Post, Body, UseGuards, UseInterceptors, Put, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import {
  ApiPagination,
  Pagination,
  PaginationInterceptor,
  PaginationOptions,
} from '../middlewares/pagination.middleware';
import { AddKeywordReq, GetKeywordAnalyticsReq, UpdateKeywordReq } from '../walmart-communicator';
import { KeywordsService } from './keywords.service';
import { ListKeywordsArgs, ListKeywordsSuggestionArgs } from './dto/keywords.dto';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';

@Controller('brands/:brandId/walmart-keywords')
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @Post('/add')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  create(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: AddKeywordReq) {
    return this.keywordsService.add(data, config.advertiser_id);
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
    @Body() data: ListKeywordsArgs,
    @Pagination() pagination: PaginationOptions,
  ) {
    return this.keywordsService.getKeywords(data, pagination, config.advertiser_id);
  }

  @Post('/get-analytics')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @ApiPagination()
  @UseInterceptors(PaginationInterceptor)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  getAnalytics(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Body() data: GetKeywordAnalyticsReq,
    @Pagination() pagination: PaginationOptions,
  ) {
    return this.keywordsService.getAnalytics(data, pagination, config.advertiser_id);
  }

  @Post('/get-suggestions')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @ApiPagination()
  @UseInterceptors(PaginationInterceptor)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  getSuggestions(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Body() data: ListKeywordsSuggestionArgs,
    @Pagination() pagination: PaginationOptions,
  ) {
    return this.keywordsService.getSuggestions(data, pagination, config.advertiser_id);
  }

  @Put('/update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: UpdateKeywordReq) {
    return this.keywordsService.update(data, config.advertiser_id);
  }
}
