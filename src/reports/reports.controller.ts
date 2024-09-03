import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { AmazonService } from './amazon.service';
import { VendoCommerceDBService } from '../prisma.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private amazonService: AmazonService, private readonly commerceSvc: VendoCommerceDBService) {}

  @Get('/sp-callback')
  async spCallback(
    @Query('selling_partner_id') selling_partner_id: string,
    @Query('state') state: string,
    @Query('spapi_oauth_code') spapi_oauth_code: string,
    @Res() res: Response,
  ) {
    const brandId = await this.amazonService.storeSpCredential({
      selling_partner_id,
      spapi_oauth_code,
      state,
    });
    return res.redirect(`https://staging.velocityportal.com/brands/edit?brandId=${brandId}&activeTab=apiCredentials`);
  }

  @Get('/ads-callback')
  async adsCallback(@Query('state') state: string, @Query('code') code: string, @Res() res: Response) {
    const brandId = await this.amazonService.storeAdsCredential({ code, state });
    return res.redirect(
      `https://staging.velocityportal.com/brands/edit?brandId=${brandId}&activeTab=advertisingCredentials`,
    );
  }

  @Get('/shipment-report-activation')
  async shipmentReportActivation(@Query('brandId') brandId: string) {
    return this.commerceSvc.brands.findUniqueOrThrow({
      where: {
        id: Number(brandId),
      },
      select: {
        is_shipment_reports_active: true,
      },
    });
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/shipment-report-activation-toggle')
  async shipmentReportActivationToggle(@Query('brandId') brandId: string) {
    const currentState = await this.commerceSvc.brands.findUniqueOrThrow({
      where: {
        id: Number(brandId),
      },
      select: {
        is_shipment_reports_active: true,
      },
    });
    await this.commerceSvc.brands.update({
      where: {
        id: Number(brandId),
      },
      data: {
        is_shipment_reports_active: !currentState.is_shipment_reports_active,
      },
    });
    return { is_shipment_reports_activate: !currentState.is_shipment_reports_active };
  }
}
