import { Controller, Post, Body, UseGuards, UseInterceptors, Put, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { BidPlatform } from '../walmart-communicator';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { BidPlatformService } from './bid-platform.service';
import { ListBidPlatformItemArgs } from './dto/bid-platform';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';

@Controller('brands/:brandId/walmart-bid-platform')
export class BidPlatformController {
  constructor(private readonly bidPlatformService: BidPlatformService) {}

  @Post('/get')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  list(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: ListBidPlatformItemArgs) {
    return this.bidPlatformService.listBidPlatform(data, config.advertiser_id);
  }

  @Post('/create')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  create(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: BidPlatform[]) {
    return this.bidPlatformService.create(data, config.advertiser_id);
  }

  @Put('/update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: BidPlatform) {
    return this.bidPlatformService.update(data, config.advertiser_id);
  }
}
