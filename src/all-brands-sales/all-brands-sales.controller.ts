import { Body, Controller, ParseArrayPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AllBrandsSalesService } from './all-brands-sales.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@Controller('all-brands/sales/')
export class AllBrandsSalesController {
  constructor(private readonly svc: AllBrandsSalesService) {}

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Post('daily')
  async getSalesForAllBrandsDaily(
    @Body() body: { filters: { [brandId: number]: { from?: Date; to?: Date } } },
    @Query('ams', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) ams: number[],
    @Query('categories', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) categories: number[],
    @Query('brandIds', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) brandIds: number[],
  ) {
    return await this.svc.getSalesForAllBrandsDaily(body.filters, { ams, categories, brandIds });
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Post('weekly')
  async getSalesForAllBrandsWeekly(
    @Body() body: { [brandId: number]: { from?: Date; to?: Date } },
    @Query('ams', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) ams: number[],
    @Query('categories', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) categories: number[],
    @Query('brandIds', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) brandIds: number[],
  ) {
    return await this.svc.getSalesForAllBrandsWeekly(body, { ams, categories, brandIds });
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Post('monthly')
  async getSalesForAllBrandsMonthly(
    @Body() body: { [brandId: number]: { from?: Date; to?: Date } },
    @Query('ams', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) ams: number[],
    @Query('categories', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) categories: number[],
    @Query('brandIds', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) brandIds: number[],
  ) {
    return await this.svc.getSalesForAllBrandsMonthly(body, { ams, categories, brandIds });
  }
}
