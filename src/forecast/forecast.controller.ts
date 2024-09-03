import {
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseArrayPipe,
  ParseFilePipe,
  ParseIntPipe,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from 'prisma/commerce/generated/vendoCommerce';
import { Roles, RoleGuard } from 'src/Auth/guards/role.guard';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Put('/:brandId/import')
  @UseInterceptors(FileInterceptor('file'))
  async importProductData(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query('year', ParseIntPipe) year: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'sheet' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.forecastService.extractDataFromExcel(file.buffer, year, brandId);
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get()
  async getForecast(
    @Query('months') months: string,
    @Query('year') year: string,
    @Query('brandIds', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) brandsId?: number[],
    @Query('categoryIds', new ParseArrayPipe({ items: Number, separator: ',', optional: true }))
    categoriesId?: number[],
    @Query('amIds', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) AMs?: number[],
  ) {
    return await this.forecastService.calculateForecast({ brandsId, months, year, AMs, categoriesId });
  }
}
