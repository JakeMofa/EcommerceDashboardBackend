import {
  Controller,
  Get,
  Put,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  ParseArrayPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { AdvertisingService } from './advertising.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandAccessMiddleware, db_write } from 'src/middlewares/brandAccess.middleware';
import { BrandSource, CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@BrandSource('Amazon')
@Controller('/brands/:brandId/')
export class AdvertisingController {
  constructor(private advertisingService: AdvertisingService) {}

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('advertising-data')
  @UseInterceptors(BrandAccessMiddleware)
  async getAdvertisingData(
    @Query('year') year: string,
    @Query('weeks') weeks: string,
    @Query('search') search: string,
  ) {
    return await this.advertisingService.getAdvertiseData(weeks, year, search);
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('advertising-total-revenue')
  @UseInterceptors(BrandAccessMiddleware)
  async getTotalRevenue(
    @Query('weeks', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) weeks: number[],
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) years: number[],
    @Query('search') search: string,
  ) {
    return await this.advertisingService.getTotalRevenueWeekly({
      weeks: weeks.join(','),
      years: years.join(','),
      search,
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('advertising-total-revenue-monthly')
  @UseInterceptors(BrandAccessMiddleware)
  async getTotalRevenueMonthly(
    @Query('months', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) months: number[],
    @Query('years', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) years: number[],
    @Query('search') search: string,
  ) {
    return await this.advertisingService.getTotalRevenueMonthly({
      months: months.join(','),
      years: years.join(','),
      search,
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('advertising-campaign-data')
  @UseInterceptors(BrandAccessMiddleware)
  async getCampaignsData(
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
    @Query('search') search: string,
  ) {
    return this.advertisingService.getCampaignData({ start_date, end_date, search });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('advertising-campaign-graph')
  @UseInterceptors(BrandAccessMiddleware)
  async getCampaignsGraph(
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
    @Query('search') search: string,
    @Query('campaign_ids', new ParseArrayPipe({ items: Number, separator: ',', optional: true }))
    campaign_ids: number[],
  ) {
    return this.advertisingService.getCampaignGraph({ start_date, end_date, search, campaign_ids });
  }

  @db_write()
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Put('advertising-data')
  @UseInterceptors(BrandAccessMiddleware)
  @UseInterceptors(FileInterceptor('file'))
  async importAdvertisingData(
    @Param('brandId', ParseIntPipe) brandId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'sheet' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.advertisingService.importAdvertisingData(brandId, file);
  }
}
