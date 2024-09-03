import { Controller, Post, Body, UseGuards, UseInterceptors, Put, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RoleGuard, Roles } from '../Auth/guards/role.guard';
import { Role } from '../../prisma/commerce/generated/vendoCommerce';
import {
  ApiPagination,
  Pagination,
  PaginationInterceptor,
  PaginationOptions,
} from '../middlewares/pagination.middleware';
import { AddAdItemToAdGroupReq, UpdateAdItemReq } from '../walmart-communicator';
import { AdItemService } from './ad-item.service';
import { ListAdItemArgs } from './dto/ad-item.dto';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@Controller('brands/:brandId/walmart-ad-item')
export class AdItemController {
  constructor(private readonly adItemService: AdItemService) {}

  @Post('/add')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  create(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: AddAdItemToAdGroupReq) {
    return this.adItemService.addAdItem(data, config.advertiser_id);
  }

  @Post('/get')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @ApiPagination()
  @UseInterceptors(PaginationInterceptor)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  findAll(
    @ExtractWalmartConfig() config: WalmartConfig,
    @Body() data: ListAdItemArgs,
    @Pagination() pagination: PaginationOptions,
  ) {
    return this.adItemService.getAdItems(data, pagination, config.advertiser_id);
  }

  @Put('/update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() updateAdItemReq: UpdateAdItemReq) {
    return this.adItemService.update(updateAdItemReq, config.advertiser_id);
  }
}
