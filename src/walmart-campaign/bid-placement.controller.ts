import { Controller, Post, Body, UseGuards, UseInterceptors, Put, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { BidPlacement } from '../walmart-communicator';
import { RoleGuard, Roles } from '../Auth/guards/role.guard';
import { Role } from '../../prisma/commerce/generated/vendoCommerce';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { BidPlacementService } from './bid-placement.service';
import { ListBidItemArgs } from './dto/bid';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@Controller('brands/:brandId/walmart-bid-placement')
export class BidPlacementController {
  constructor(private readonly bidPlacementService: BidPlacementService) {}

  @Post('/get')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  list(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: ListBidItemArgs) {
    return this.bidPlacementService.listBidPlacement(data, config.advertiser_id);
  }

  @Post('/create')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  create(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: BidPlacement[]) {
    return this.bidPlacementService.create(data, config.advertiser_id);
  }

  @Put('/update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: BidPlacement) {
    return this.bidPlacementService.update(data, config.advertiser_id);
  }
}
