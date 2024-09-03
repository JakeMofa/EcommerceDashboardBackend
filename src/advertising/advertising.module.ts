import { Module } from '@nestjs/common';
import { AdvertisingService } from './advertising.service';
import { DatabaseBrandModule, DatabaseCommerceModule } from '../brands/database.service';
import { AdvertisingController } from './advertising.controller';
import { BrandsService } from '../brands/brands.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [CaslModule, ConfigModule, HttpModule, DatabaseBrandModule, DatabaseCommerceModule],
  providers: [BrandsService, AdvertisingService],
  exports: [AdvertisingService],
  controllers: [AdvertisingController],
})
export class AdvertisingModule {}
