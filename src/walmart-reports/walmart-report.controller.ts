import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { CheckAbility } from '../casl/casl-ability.decorator';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { CaslAbilityGuard } from '../casl/casl-ability.guard';
import { WalmartReportService } from './walmart-report.service';
import { AdReportsLogsReq } from './dto/ad-logs-req.dto';
import { CampaignTypes, PeriodType } from './dto/campaign-performance.dto';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import {
  AdItemGroupByRange,
  AdItemGroupByTypes,
  KeywordGroupByTypes,
  AdItemIncludeEnum,
} from './dto/ad-item-filter.dto';

@Controller('brands/:brandId/walmart-report')
export class WalmartReportController {
  constructor(private readonly walmartReportService: WalmartReportService) {}

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  @Get('performance-report')
  async campaignPerformanceReport(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('campaignsType') campaignType: CampaignTypes,
    @Query('periodType') periodType: PeriodType,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.walmartReportService.campaignPerformanceReport(
      brandId,
      config.advertiser_id,
      campaignType,
      periodType,
      startDate,
      endDate,
    );
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  @Get('awareness-report')
  async campaignAwarenessReport(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('campaignsType') campaignType: CampaignTypes,
    @Query('periodType') periodType: PeriodType,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.walmartReportService.campaignAwarenessReport(
      brandId,
      config.advertiser_id,
      campaignType,
      periodType,
      startDate,
      endDate,
    );
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  @Get('efficiency-report')
  async campaignEfficiencyReport(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('campaignsType') campaignType: CampaignTypes,
    @Query('periodType') periodType: PeriodType,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.walmartReportService.campaignEfficiencyReport(
      brandId,
      config.advertiser_id,
      campaignType,
      periodType,
      startDate,
      endDate,
    );
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  @Get('placement-performance-report')
  async placementPlatformReport(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.walmartReportService.placementPlatformReport(brandId, startDate, endDate);
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  @Get('platform-performance-report')
  async platformPerformanceReport(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('campaignsType') campaignType: CampaignTypes,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.walmartReportService.platformPerformanceReport(
      brandId,
      config.advertiser_id,
      campaignType,
      startDate,
      endDate,
    );
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  @Get('page-type-performance-report')
  async pageTypePerformanceReport(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('campaignsType') campaignType: CampaignTypes,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.walmartReportService.pageTypePerformanceReport(
      brandId,
      config.advertiser_id,
      campaignType,
      startDate,
      endDate,
    );
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  @Get('campaign-list-chart')
  async campaignListChart(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.walmartReportService.allCampaignChart(brandId, startDate, endDate);
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('ad-item-weekly')
  async getAdItemWeekly(
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) year: number[],
    @Query('weeks', new ParseArrayPipe({ separator: ',', items: Number, optional: false })) week: number[],
  ) {
    return this.walmartReportService.getAdItemWeekly({ year, week, brandId });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Post('ad-reports-logs')
  async reports_logs(@Body() data: AdReportsLogsReq, @Param('brandId', new ParseIntPipe()) brandId: number) {
    return this.walmartReportService.adsReportLog(data, brandId);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('keyword-weekly')
  async getKeywordsWeekly(
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) year: number[],
    @Query('weeks', new ParseArrayPipe({ separator: ',', items: Number, optional: false })) week: number[],
  ) {
    return this.walmartReportService.getKeywordWeekly({ year, week, brandId });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('ad-group-weekly')
  async getAdGroupWeekly(
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) year: number[],
    @Query('weeks', new ParseArrayPipe({ separator: ',', items: Number, optional: false })) week: number[],
  ) {
    return this.walmartReportService.getAdGroupWeekly({ year, week, brandId });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  @Get('ad-item-metrics')
  async getAdItemMetrics(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('groupBy') groupBy: AdItemGroupByTypes,
    @Query('groupByRange') groupByRange: AdItemGroupByRange,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('search') search: string,
    @Query('include', new ParseArrayPipe({ items: String, separator: ',', optional: true }))
    include: AdItemIncludeEnum[],
  ) {
    return this.walmartReportService.getAdItemMetrics({
      brandId,
      startDate,
      endDate,
      advertiserId: config.advertiser_id,
      search,
      groupBy,
      groupByRange,
      include,
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  @Get('keyword-metrics')
  async getKeywordsMetrics(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('groupBy') groupBy: KeywordGroupByTypes,
    @Query('groupByRange') groupByRange: AdItemGroupByRange,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('search') search: string,
  ) {
    return this.walmartReportService.getKeywordMetrics({
      brandId,
      startDate,
      endDate,
      advertiserId: config.advertiser_id,
      search,
      groupBy,
      groupByRange,
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  @Get('ad-group-metrics')
  async getAdGroupMetrics(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('groupBy') groupBy: AdItemGroupByTypes,
    @Query('groupByRange') groupByRange: AdItemGroupByRange,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('search') search: string,
  ) {
    return this.walmartReportService.getAdGroupMetrics({
      brandId,
      startDate,
      endDate,
      advertiserId: config.advertiser_id,
      search,
      groupBy,
      groupByRange,
    });
  }
}
