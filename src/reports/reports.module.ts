import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ReportsController } from './reports.controller';
import { HttpModule } from '@nestjs/axios';
import { DatabaseBrandModule, DatabaseCommerceModule } from 'src/brands/database.service';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';
import { AmazonService } from './amazon.service';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [
    CaslModule,
    DatabaseBrandModule,
    DatabaseCommerceModule,
    HttpModule,
    BullModule.registerQueue({
      name: 'sp',
      processors: [
        {
          path: join(__dirname, 'processors', 'sp.processor.js'),
          concurrency: 10,
        },
      ],
    }),
    BullModule.registerQueue({
      name: 'ads',
      processors: [
        {
          path: join(__dirname, 'processors', 'ads.processor.js'),
          concurrency: 10,
        },
      ],
    }),
  ],
  providers: [CronService, AmazonService],
  controllers: [ReportsController],
  exports: [CronService],
})
export class ReportsModule {}
