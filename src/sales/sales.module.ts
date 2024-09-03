import { Module } from '@nestjs/common';
import { SalesBySkuService } from './sales.sku.service';
import { SalesController } from './sales.controller';
import { SalesProductService } from './sales.product.service';
import { SalesSummaryService } from './sales.summary.service';
import { SalesGraphService } from './sales.graph.service';
import { SalesCalloutWeeklyService } from './sales.callout.weekly.service';
import { DatabaseBrandModule, DatabaseCommerceModule } from '../brands/database.service';
import { BrandsService } from '../brands/brands.service';
import { AdvertisingService } from '../advertising/advertising.service';
import { ConfigModule } from '@nestjs/config';
import { SalesService } from './sales.service';
import { CaslModule } from 'src/casl/casl.module';
import { SalesCalloutMonthlyService } from './sales.callout.monthly.service';

@Module({
  imports: [CaslModule, ConfigModule, DatabaseBrandModule, DatabaseCommerceModule],
  controllers: [SalesController],
  providers: [
    AdvertisingService,
    SalesService,
    BrandsService,
    SalesBySkuService,
    SalesProductService,
    SalesSummaryService,
    SalesGraphService,
    SalesCalloutWeeklyService,
    SalesCalloutMonthlyService,
  ],
  exports: [
    SalesService,
    SalesBySkuService,
    SalesProductService,
    SalesSummaryService,
    SalesCalloutWeeklyService,
    SalesGraphService,
    SalesCalloutMonthlyService,
  ],
})
export class SalesModule {}
