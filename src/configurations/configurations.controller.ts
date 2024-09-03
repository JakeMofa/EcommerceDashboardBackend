import { Controller, Get, Body, UseGuards, Param, Patch, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { VendoCommerceDBService } from 'src/prisma.service';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { db_write } from 'src/middlewares/brandAccess.middleware';

@Controller('brands/:brandId/configurations')
export class ConfigurationsController {
  constructor(private readonly commerceDB: VendoCommerceDBService) {}

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get()
  async getData(@Param('brandId') brandId: string, @Query('key') key: string) {
    const config = await this.commerceDB.configuration.findFirst({
      where: {
        AND: [{ brandId: Number(brandId) }, { key: { equals: key } }],
      },
    });
    console.log(config?.value);
    return JSON.parse(config?.value || '[]');
  }

  @db_write()
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Patch()
  async setData(@Param('brandId') brandId: string, @Query('key') key: string, @Body() config: []) {
    const configuration = await this.commerceDB.configuration.findFirst({
      where: {
        key,
        brandId: Number(brandId),
      },
    });
    let result;
    if (configuration) {
      result = await this.commerceDB.configuration.update({
        where: {
          id: configuration.id,
        },
        data: {
          value: JSON.stringify(config),
        },
      });
    }
    result = await this.commerceDB.configuration.create({
      data: {
        key,
        value: JSON.stringify(config, null),
        brandId: Number(brandId),
      },
    });
    return JSON.parse(result.value);
  }
}
