import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseBrandModule, DatabaseCommerceModule } from '../brands/database.service';
import { WalmartReportController } from './walmart-report.controller';
import { WalmartReportService } from './walmart-report.service';
import { CaslModule } from '../casl/casl.module';
import { WalmartCampaignClient, WalmartReportClient } from './walmart-reports-client.service';
import { BrandsService } from '../brands/brands.service';
@Module({
  imports: [DatabaseBrandModule, DatabaseCommerceModule, ConfigModule, CaslModule],
  controllers: [WalmartReportController],
  providers: [WalmartReportService, WalmartReportClient, WalmartCampaignClient, BrandsService],
  exports: [WalmartReportService, WalmartReportClient, WalmartCampaignClient],
})
export class WalmartReportModule {}
