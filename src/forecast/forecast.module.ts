import { Module } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ForecastController } from './forecast.controller';
import { DatabaseCommerceModule, DatabaseBrandModule } from 'src/brands/database.service';
import { BrandsModule } from 'src/brands/brands.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [CaslModule, BrandsModule, DatabaseCommerceModule, DatabaseBrandModule],
  controllers: [ForecastController],
  providers: [ForecastService],
})
export class ForecastModule {}
