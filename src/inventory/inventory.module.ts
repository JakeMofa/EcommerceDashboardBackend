import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { BrandsService } from 'src/brands/brands.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseBrandModule, DatabaseCommerceModule } from 'src/brands/database.service';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [DatabaseBrandModule, DatabaseCommerceModule, ConfigModule, CaslModule],
  controllers: [InventoryController],
  providers: [InventoryService, BrandsService],
})
export class InventoryModule {}
