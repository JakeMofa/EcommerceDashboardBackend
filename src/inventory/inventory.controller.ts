import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { BrandAccessMiddleware } from 'src/middlewares/brandAccess.middleware';
import { InventoryManagementDto } from './dto/inventory.dto';

@Controller('brands/:brandId/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: 'Get Latest Restock Data' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('latest-restock')
  async getLatestRestock(@Param('brandId', new ParseIntPipe()) brandId: number) {
    return await this.inventoryService.getLatestRestockData(brandId);
  }

  @ApiOperation({ summary: 'Get Latest Restock Data' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @ApiParam({ name: 'asin', description: 'asin product ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Put('management/:asin')
  async addInventoryManagement(
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Param('asin') asin: string,
    @Body() body: InventoryManagementDto,
  ) {
    return await this.inventoryService.addInventoryManagement(brandId, { ...body, asin });
  }

  @ApiOperation({ summary: 'Get Latest Restock Data' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('management')
  async inventoryManagement(@Param('brandId', new ParseIntPipe()) brandId: number) {
    return await this.inventoryService.getInventoryManagement(brandId);
  }
}
