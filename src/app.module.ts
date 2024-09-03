import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './Auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './middlewares/exception.middleware';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { SalesModule } from './sales/sales.module';
import { ReportsModule } from './reports/reports.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CustomerAcquisitionModule } from './customer-acquisition/customer-acquisition.module';
import { DatabaseBrandModule, DatabaseCommerceModule } from './brands/database.service';
import { HttpModule } from '@nestjs/axios';
import { ReportLogModule } from './report-log/report-log.module';
import { ConfigurationsModule } from './configurations/configurations.module';
import { ForecastModule } from './forecast/forecast.module';
import { AllBrandsSalesModule } from './all-brands-sales/all-brands-sales.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { WalmartCampaignModule } from './walmart-campaign/walmart-campaign.module';
import { CaslModule } from './casl/casl.module';
import { WalmartReportModule } from './walmart-reports/walmart-report.module';
import { BudgetManagementModule } from './budget-management/budget-management.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    HttpModule,
    DatabaseBrandModule,
    DatabaseCommerceModule,
    AuthModule,
    UsersModule,
    BrandsModule,
    CategoriesModule,
    SalesModule,
    ReportsModule,
    AllBrandsSalesModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ScheduleModule.forRoot(),
    CustomerAcquisitionModule,
    ReportLogModule,
    ConfigurationsModule,
    ForecastModule,
    WalmartCampaignModule,
    WalmartReportModule,
    CaslModule,
    BudgetManagementModule,
    InventoryModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
