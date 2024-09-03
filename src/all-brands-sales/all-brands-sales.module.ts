import { Module } from '@nestjs/common';
import { ReportsModule } from '../reports/reports.module';
import { AllBrandsSalesController } from './all-brands-sales.controller';
import { AllBrandsSalesService } from './all-brands-sales.service';
import { DatabaseCommerceModule } from '../brands/database.service';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [CaslModule, ReportsModule, DatabaseCommerceModule],
  providers: [AllBrandsSalesService],
  controllers: [AllBrandsSalesController],
})
export class AllBrandsSalesModule {}
