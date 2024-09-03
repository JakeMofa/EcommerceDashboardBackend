import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class InventoryManagementDto {
  @ApiProperty({
    description: 'Multiplier for inventory management',
    example: 2.4,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  multiplier?: number;

  @ApiProperty({
    description: 'Quantity of product on hand',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  on_hand?: number;
}
