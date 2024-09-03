import { Module } from '@nestjs/common';
import { CustomerAcquisitionService } from './customer-acquisition.service';
import { CustomerAcquisitionController } from './customer-acquisition.controller';
import { AdvertisingModule } from 'src/advertising/advertising.module';
import { DatabaseCommerceModule, DatabaseBrandModule } from '../brands/database.service';
import { BrandsService } from '../brands/brands.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [CaslModule, ConfigModule, HttpModule, AdvertisingModule, DatabaseCommerceModule, DatabaseBrandModule],
  controllers: [CustomerAcquisitionController],
  providers: [BrandsService, CustomerAcquisitionService],
  exports: [CustomerAcquisitionService],
})
export class CustomerAcquisitionModule {}
