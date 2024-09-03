import { Module } from '@nestjs/common';
import { ReportLogService } from './report-log.service';
import { ReportLogController } from './report-log.controller';
import { DatabaseBrandModule, DatabaseCommerceModule } from '../brands/database.service';
import { BrandsService } from '../brands/brands.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommerceApiFactory, Configuration } from '../walmart-communicator';
import { CentralLogController } from './central-log.controller';
import { CentralLogService } from './central-log.service';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [ConfigModule, HttpModule, DatabaseBrandModule, DatabaseCommerceModule, CaslModule],
  controllers: [ReportLogController, CentralLogController],
  providers: [
    ReportLogService,
    CentralLogService,
    BrandsService,
    {
      provide: 'DJANGO_COMMERCE_API',
      useFactory: (configService: ConfigService) => {
        return CommerceApiFactory(
          new Configuration({
            apiKey: configService.get('WALMART_DJANGO_APIKEY'),
            basePath: configService.get('WALMART_PRODUCTION_DJANGO_BASE_URL'),
          }),
        );
      },
      inject: [ConfigService],
    },
  ],
})
export class ReportLogModule {}
