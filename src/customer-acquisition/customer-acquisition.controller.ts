import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  ParseArrayPipe,
} from '@nestjs/common';
import { CustomerAcquisitionService } from './customer-acquisition.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { BrandAccessMiddleware } from 'src/middlewares/brandAccess.middleware';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { PrivateKeyGuard } from 'src/Auth/privateKey.guard';
import { ApiPagination, Pagination, PaginationOptions } from 'src/middlewares/pagination.middleware';

@Controller('brands/:brandId/')
export class CustomerAcquisitionController {
  constructor(private readonly customerAcquisitionService: CustomerAcquisitionService) {}

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('customer-acquisition')
  @UseInterceptors(BrandAccessMiddleware)
  async getCustomerAcquisition(
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) year: number[],
    @Query('months') months: string,
    @Param('brandId', new ParseIntPipe()) brandId: number,
  ) {
    return this.customerAcquisitionService.newVsOldCustomers(year, months, brandId);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('customer-acquisition-weekly')
  @UseInterceptors(BrandAccessMiddleware)
  async getCustomerAcquisitionWeekly(
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) year: number[],
    @Query('weeks') weeks: string,
    @Param('brandId', new ParseIntPipe()) brandId: number,
  ) {
    return this.customerAcquisitionService.newVsOldCustomersWeekly(year, weeks, brandId);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @ApiPagination()
  @Get('breakdown')
  async getProductBreakdown(
    @Query('search') search: string,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) year: number[],
    @Query('months', new ParseArrayPipe({ separator: ',', items: Number, optional: true })) month: number[],
    @Pagination() pagination: PaginationOptions,
  ) {
    const { result, total } = await this.customerAcquisitionService.getProductBreakDown({
      year,
      month,
      brandId,
      pagination,
      search,
    });
    const totalCount = await this.customerAcquisitionService.countMonthlyProducts({ year, month, brandId, search });
    return {
      items: result,
      total,
      page: pagination.page,
      limit: pagination.limit,
      orderBy: pagination.orderBy,
      order: pagination.order,
      count: Number(totalCount),
    };
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('breakdown-weekly')
  async getProductBreakdownWeekly(
    @Query('search') search: string,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) year: number[],
    @Query('weeks', new ParseArrayPipe({ separator: ',', items: Number, optional: false })) week: number[],
    @Pagination() pagination: PaginationOptions,
  ) {
    const { result, total } = await this.customerAcquisitionService.getProductBreakDownWeekly({
      year,
      week,
      brandId,
      pagination,
      search,
    });
    const totalCount = await this.customerAcquisitionService.countWeeklyProducts({ year, week, brandId, search });
    return {
      items: result,
      total,
      page: pagination.page,
      limit: pagination.limit,
      orderBy: pagination.orderBy,
      order: pagination.order,
      count: Number(totalCount),
    };
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('category-breakdown')
  @UseInterceptors(BrandAccessMiddleware)
  async getCategoryBreakdown(
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) year: number[],
    @Query('months', new ParseArrayPipe({ separator: ',', items: Number, optional: false })) month: number[],
    @Query('categoryIds', new ParseArrayPipe({ separator: ',', items: Number, optional: true })) categoryIds: number[],
  ) {
    return this.customerAcquisitionService.getCategoryBreakDown({ year, month, brandId, categoryIds });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('category-breakdown-weekly')
  @UseInterceptors(BrandAccessMiddleware)
  async getCategoryBreakdownWeekly(
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) year: number[],
    @Query('weeks', new ParseArrayPipe({ separator: ',', items: Number, optional: false })) week: number[],
    @Query('categoryIds', new ParseArrayPipe({ separator: ',', items: Number, optional: true })) categoryIds: number[],
  ) {
    return this.customerAcquisitionService.getCategoryBreakDownWeekly({ year, week, brandId, categoryIds });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('new-customer-sales')
  @UseInterceptors(BrandAccessMiddleware)
  async getCustomerAcquisitionSales(@Param('brandId', new ParseIntPipe()) brandId: number) {
    return this.customerAcquisitionService.getLTV(brandId);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('new-customer-sales-prediction')
  @UseInterceptors(BrandAccessMiddleware)
  async getCustomerAcquisitionSalesPrediction(
    @Query('months', new ParseIntPipe()) months: number,
    @Param('brandId', new ParseIntPipe()) brandId: number,
  ) {
    return this.customerAcquisitionService.getPridiction(months, brandId);
  }

  @UseGuards(PrivateKeyGuard)
  @Get('auth-key-sample')
  async authKeySample() {
    return 'authorized successfully';
  }
}
