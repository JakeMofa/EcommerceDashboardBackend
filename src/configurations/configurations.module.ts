import { Module } from '@nestjs/common';
import { ConfigurationsController } from './configurations.controller';
import { DatabaseBrandModule, DatabaseCommerceModule } from '../brands/database.service';
import { HttpModule } from '@nestjs/axios';
import { BrandsModule } from 'src/brands/brands.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [BrandsModule, HttpModule, DatabaseBrandModule, DatabaseCommerceModule, CaslModule],
  controllers: [ConfigurationsController],
})
export class ConfigurationsModule {}
