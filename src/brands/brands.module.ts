import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { DatabaseBrandModule, DatabaseCommerceModule } from './database.service';
import { UsersService } from 'src/users/users.service';
import { SalesModule } from 'src/sales/sales.module';
import { CustomerAcquisitionModule } from 'src/customer-acquisition/customer-acquisition.module';
import { AdvertisingModule } from '../advertising/advertising.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CaslModule } from 'src/casl/casl.module';
@Module({
  imports: [
    CaslModule,
    ConfigModule,
    HttpModule,
    DatabaseCommerceModule,
    DatabaseBrandModule,
    SalesModule,
    AdvertisingModule,
    CustomerAcquisitionModule,
  ],
  controllers: [BrandsController],
  providers: [UsersService, BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
