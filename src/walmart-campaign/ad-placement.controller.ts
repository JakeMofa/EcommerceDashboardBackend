import { Controller, Post, Body, UseGuards, UseInterceptors, Put, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { SubmitPlacementReq } from '../walmart-communicator';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { AdPlacementService } from './ad-placement.service';
import { AdPlacementListReq } from './dto/ad-placement-list.dto';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';

@Controller('brands/:brandId/ad-placement')
export class AdPlacementController {
  constructor(private readonly adPlacementService: AdPlacementService) {}

  @Post('/get')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  list(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: AdPlacementListReq) {
    return this.adPlacementService.listAdPlacement(data, config.advertiser_id);
  }
  @Put('/update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: SubmitPlacementReq) {
    return this.adPlacementService.update(data, config.advertiser_id);
  }
}
