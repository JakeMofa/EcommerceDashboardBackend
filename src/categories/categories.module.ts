import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryProductDataService } from './category-product-data.service';
import { CategoryReportService } from './category-report.service';
import { CategoriesController } from './categories.controller';
import { DatabaseBrandModule, DatabaseCommerceModule } from '../brands/database.service';
import { BrandsService } from '../brands/brands.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [CaslModule, ConfigModule, HttpModule, DatabaseBrandModule, DatabaseCommerceModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryProductDataService, CategoryReportService, BrandsService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
