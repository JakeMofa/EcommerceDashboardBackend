import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ReportLogService } from './report-log.service';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { Pagination, PaginationInterceptor, PaginationOptions } from 'src/middlewares/pagination.middleware';
import { BrandAccessMiddleware } from 'src/middlewares/brandAccess.middleware';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';

@Controller('brands/:brandId/report-logs')
export class ReportLogController {
  constructor(private readonly reportLogService: ReportLogService) {}

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(PaginationInterceptor)
  @UseInterceptors(BrandAccessMiddleware)
  @Get()
  async findAll(
    @Query('marketplace') marketplace: string,
    @Query('reportType') reportType: string,
    @Query('reportRequestStatus') reportRequestStatus: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Pagination() pagination: PaginationOptions,
  ) {
    const data = await this.reportLogService.findAll(
      marketplace,
      reportType,
      reportRequestStatus,
      startDate,
      endDate,
      pagination,
    );
    return {
      items: data.items,
      count: data.count,
      page: pagination.page,
      limit: pagination.limit,
      orderBy: pagination.orderBy,
      order: pagination.order,
    };
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('summary')
  async summary() {
    return await this.reportLogService.summary();
  }
}
