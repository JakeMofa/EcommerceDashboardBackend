import {
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SalesBySkuService } from './sales.sku.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { ApiPagination, Pagination, PaginationOptions } from '../middlewares/pagination.middleware';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SKUResponseDto } from './dto/sku.dto';
import { SalesProductService } from './sales.product.service';
import { SalesSummaryService } from './sales.summary.service';
import { SalesGraphService } from './sales.graph.service';
import { SalesCalloutWeeklyService } from './sales.callout.weekly.service';
import { SalesService } from './sales.service';
import { BrandAccessMiddleware } from 'src/middlewares/brandAccess.middleware';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { BrandSource, CheckAbility } from 'src/casl/casl-ability.decorator';
import { SalesCalloutMonthlyService } from './sales.callout.monthly.service';

@BrandSource('Amazon')
@Controller('brands/:brandId/sales/')
export class SalesController {
  constructor(
    private salesBySkuService: SalesBySkuService,
    private salesService: SalesService,
    private salesProductService: SalesProductService,
    private salesSummaryService: SalesSummaryService,
    private salesGraphService: SalesGraphService,
    private salesCalloutWeeklyService: SalesCalloutWeeklyService,
    private salesCalloutMonthlyService: SalesCalloutMonthlyService,
  ) {}

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @ApiPagination()
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'search by sku',
  })
  @ApiResponse({
    type: SKUResponseDto,
  })
  @UseInterceptors(BrandAccessMiddleware)
  @Get('sales-by-sku')
  async getSalesBySkuData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Pagination() pagination: PaginationOptions,
    @Param('brandId') brandId: string,
    @Query('search') search?: string,
  ) {
    if (pagination.orderBy === 'created_at') {
      pagination.orderBy = 'astr_date';
    }
    const sku = await this.salesBySkuService.getSalesBySkuData(startDate, endDate, pagination, brandId, search);
    const count = await this.salesBySkuService.getSalesBySkuCount(startDate, endDate, search);
    const total = count[0]?.total_asin || 0;
    return {
      items: { summary: sku.summary, details: sku.details },
      page: pagination.page,
      limit: pagination.limit,
      orderBy: pagination.orderBy,
      order: pagination.order,
      count: Number(total),
    };
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('sales-by-sku-graph')
  async getSalesBySkuGraph(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('search') search?: string,
  ) {
    return await this.salesBySkuService.getSkuGraph({ startDate, endDate, search });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('sales-by-product')
  async getSalesByProduct(
    @Param('brandId') brandId: string,
    @Query('weeks', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) weeks: number[],
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) years: number[],
    @Pagination() pagination: PaginationOptions,
    @Query('search') search: string,
  ) {
    const { page, limit, order, orderBy } = pagination;

    const products = await this.salesProductService.getSalesByProduct(
      years.join(','),
      weeks.join(','),
      brandId,
      pagination,
      search,
    );
    const count = await this.salesProductService.getSalesByProductCount(years.join(','), weeks.join(','), search);
    const total = count[0]?.total_asin || 0;
    return { items: products, page, limit, count: Number(total), order, orderBy };
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('sales-by-week-summary')
  async getSalesByWeekSummary(
    @Query('weeks', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) weeks: number[],
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) years: number[],
  ) {
    return await this.salesSummaryService.getWeekSummary(years.join(','), weeks);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('sales-by-week-data')
  async getSalesByWeekData(
    @Query('weeks', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) weeks: number[],
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) years: number[],
  ) {
    return await this.salesService.getSalesData({
      years: years.join(','),
      weeks: weeks.join(','),
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('sales-by-month-summary')
  async getSalesByMonthSummary(
    @Query('months', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) months: number[],
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) years: number[],
  ) {
    return await this.salesSummaryService.getMonthSummary(years.join(','), months);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('sales-by-month-data')
  async getSalesByMonthData(
    @Query('months', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) months: number[],
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) years: number[],
  ) {
    return await this.salesService.getSalesData({
      years: years.join(','),
      months: months.join(','),
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('sales-detail')
  async getSalesDetail(
    @Query('month', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) month: number[],
    @Query('week', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) week: number[],
    @Query('year', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) year: number[],
  ) {
    return await this.salesService.getSalesDetail({
      year: year.join(','),
      month: month?.join(','),
      week: week?.join(','),
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('sales-graph-data')
  async getSalesGraphData(
    @Query('graph_filter_type') graphFilterType: string,
    @Query('months', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) months: number[],
    @Query('weeks', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) weeks: number[],
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) years: number[],
    @Query('sku', new ParseArrayPipe({ items: String, separator: ',', optional: true }))
    sku: string[],
    @Query('child_asins', new ParseArrayPipe({ items: String, separator: ',', optional: true }))
    child_asins: string[],
    @Query('parent_asins', new ParseArrayPipe({ items: String, separator: ',', optional: true }))
    parent_asins: string[],
  ) {
    return await this.salesGraphService.salesGraphData({
      graphFilterType,
      months,
      weeks,
      years: years.join(','),
      sku,
      child_asins,
      parent_asins,
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('sales-asins')
  async getAsins(
    @Query('months', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) months: number[],
    @Query('weeks', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) weeks: number[],
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) years: number[],
  ) {
    return await this.salesService.getAllAsins({
      months,
      weeks,
      years,
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('sales-callout-data')
  @UseInterceptors(BrandAccessMiddleware)
  async getCalloutData(
    @Query('weeks', new ParseArrayPipe({ items: Number, separator: ',' })) weeks: number[],
    @Query('year', new ParseIntPipe()) year: number,
  ) {
    return this.salesCalloutWeeklyService.getSalesByProduct(year, weeks);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('sales-callout-data-monthly')
  @UseInterceptors(BrandAccessMiddleware)
  async getCalloutDataMonthly(
    @Query('months', new ParseArrayPipe({ items: Number, separator: ',' })) months: number[],
    @Query('year', new ParseIntPipe()) year: number,
  ) {
    return this.salesCalloutMonthlyService.getSalesByProduct(year, months);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('sales-selected-callout')
  @UseInterceptors(BrandAccessMiddleware)
  async getSelectedCalloutData(
    @Query('week', new ParseIntPipe()) week: number,
    @Query('year', new ParseIntPipe()) year: number,
    @Query('lastFullPeriod') lastFullPeriod: boolean,
  ) {
    return this.salesCalloutWeeklyService.getSelectedCalloutData(year, week, lastFullPeriod);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('sales-selected-callout-monthly')
  @UseInterceptors(BrandAccessMiddleware)
  async getSelectedCalloutDatMonthly(
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @Query('lastFullPeriod') lastFullPeriod: boolean,
  ) {
    return this.salesCalloutMonthlyService.getSelectedCalloutData(year, month, lastFullPeriod);
  }
}
