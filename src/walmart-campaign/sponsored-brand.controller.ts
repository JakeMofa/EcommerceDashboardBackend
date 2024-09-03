import { Controller, Post, Body, UseGuards, UseInterceptors, Put, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import {
  CreateSponsoredBrandRequest,
  ListSponsoredBrandRequest,
  UpdateSponsoredBrandRequest,
  UploadSponsoredBrandLogoRequest,
} from '../walmart-communicator';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from '../utils/walmart';
import { WalmartConfigMiddleware } from '../middlewares/walmartConfig.middleware';
import { SponsoredBrandService } from './sponsored-brand.service';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@Controller('brands/:brandId/walmart-sponsored-brand')
export class SponsoredBrandController {
  constructor(private readonly sponsoredBrandService: SponsoredBrandService) {}

  @Post('/get')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  list(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: ListSponsoredBrandRequest) {
    return this.sponsoredBrandService.listSponsoredBrand(data, config.advertiser_id);
  }

  @Post('/create')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  create(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: CreateSponsoredBrandRequest[]) {
    return this.sponsoredBrandService.create(data, config.advertiser_id);
  }

  @Post('/upload-logo')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  uploadLogo(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: UploadSponsoredBrandLogoRequest) {
    return this.sponsoredBrandService.uploadLogo(data, config.advertiser_id);
  }

  @Put('/update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  update(@ExtractWalmartConfig() config: WalmartConfig, @Body() data: UpdateSponsoredBrandRequest) {
    return this.sponsoredBrandService.update(data, config.advertiser_id);
  }
}
