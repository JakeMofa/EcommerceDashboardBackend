import { Injectable, Module } from '@nestjs/common';
import { VendoBrandDBService } from '../prisma.service';
import { VendoCommerceDBService } from 'src/prisma.service';
import * as shell from 'shelljs';
@Injectable()
export class DatabaseService {
  constructor(private readonly prismaService: VendoBrandDBService) {}

  async createAndInitDatabase(databaseName: string) {
    await this.prismaService.createDatabase(databaseName);
    await this.prismaService.reconnectMaster(databaseName);
    return shell.exec(
      `export DATABASE_URL=${
        process.env.DATABASE_URL + databaseName
      } && echo $DATABASE_URL && npx prisma db execute --url=$DATABASE_URL --file=prisma/brand/migrations/20230416232924_/migration.sql`,
    );
  }
}

@Module({
  imports: [],
  providers: [VendoBrandDBService, DatabaseService],
  exports: [VendoBrandDBService, DatabaseService],
})
export class DatabaseBrandModule {}

@Module({
  imports: [],
  providers: [VendoCommerceDBService],
  exports: [VendoCommerceDBService],
})
export class DatabaseCommerceModule {}
