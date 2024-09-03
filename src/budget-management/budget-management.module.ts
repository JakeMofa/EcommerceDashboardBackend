import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetManagementController } from './budget-management.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseBrandModule, DatabaseCommerceModule } from 'src/brands/database.service';
import { CaslModule } from 'src/casl/casl.module';
import { WalmartReportModule } from 'src/walmart-reports/walmart-report.module';
import { BrandsService } from 'src/brands/brands.service';
import { TagService } from './tag.service';
import { CampaignService } from './campaign.service';
import { CampaignApiService } from 'src/walmart-campaign/campaign.service';
import { WalmartCampaignModule } from 'src/walmart-campaign/walmart-campaign.module';

@Module({
  imports: [
    WalmartReportModule,
    DatabaseBrandModule,
    DatabaseCommerceModule,
    ConfigModule,
    CaslModule,
    WalmartCampaignModule,
  ],
  controllers: [BudgetManagementController],
  providers: [
    BudgetService,
    BrandsService,
    {
      provide: 'TagService',
      useExisting: TagService,
    },
    {
      provide: 'CampaignService',
      useExisting: CampaignService,
    },
    TagService,
    CampaignService,
  ],
})
export class BudgetManagementModule {}
