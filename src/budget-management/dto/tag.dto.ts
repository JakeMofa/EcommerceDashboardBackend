import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { status } from 'prisma/commerce/generated/vendoCommerce';
import { BaseCreateDto, BaseUpdateDto } from 'src/types/base.dto';

export class WalmartTagDto {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Holiday Sale', description: 'Tag name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1000, description: 'Spend amount' })
  @IsNumber()
  @IsOptional()
  spend?: number;

  @ApiProperty({ example: 'ACTIVE', enum: status, description: 'Status' })
  @IsEnum(status)
  status: status;

  @ApiProperty({ example: 1, description: 'Brand ID' })
  @IsInt()
  brandId: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  user_id: number;
}

export class CreateWalmartTagDto extends BaseCreateDto {
  @ApiProperty({ example: 'Holiday Sale', description: 'Tag name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1000, description: 'Spend amount' })
  @IsNumber()
  @IsOptional()
  spend?: number;

  @ApiProperty({ example: 'ACTIVE', enum: status, description: 'Status' })
  @IsEnum(status)
  status: status;

  @ApiProperty({ example: [1, 2], description: 'Array of campaign IDs' })
  @IsInt({ each: true })
  @IsOptional()
  walmart_campaigns?: number[];

  @ApiProperty({ example: [1, 2], description: 'Array of tag calendar' })
  @IsInt({ each: true })
  @IsOptional()
  walmart_calendars?: number[];
}

export class UpdateWalmartTagDto extends BaseUpdateDto {
  @ApiProperty({ example: 'Holiday Sale', description: 'Tag name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'ACTIVE', enum: status, description: 'Status' })
  @IsEnum(status)
  @IsOptional()
  status?: status;

  @ApiProperty({ example: [1, 2], description: 'Array of campaign IDs' })
  @IsInt({ each: true })
  @IsOptional()
  walmart_campaigns?: number[];

  @ApiProperty({ example: [1, 2], description: 'Array of tag calendar' })
  @IsInt({ each: true })
  @IsOptional()
  walmart_calendars?: number[];
}
