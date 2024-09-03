import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNumber, IsOptional } from 'class-validator';
import { status, period_type } from 'prisma/commerce/generated/vendoCommerce';
import { BaseCreateDto, BaseUpdateDto } from 'src/types/base.dto';
import { IsEitherOne } from 'src/utils/validation.util';

export class BudgetDto {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @IsInt()
  id: number;

  @ApiProperty({ example: 500.0, description: 'Budget amount' })
  @IsNumber()
  budget: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: 'ACTIVE', enum: status, description: 'Status' })
  @IsEnum(status)
  status: status;

  @ApiProperty({ example: 1, description: 'Campaign ID' })
  @IsInt()
  @IsOptional()
  campaign_id?: number;

  @ApiProperty({ example: 1, description: 'Tag ID' })
  @IsInt()
  @IsOptional()
  walmart_tagId?: number;

  @ApiProperty({ example: 'ACTIVE', enum: period_type, description: 'date type', default: period_type.DAILY })
  @IsEnum(period_type)
  period_type: period_type;
}

export class CreateBudgetDto extends BaseCreateDto {
  @ApiProperty({ example: 500.0, description: 'Budget amount' })
  @IsNumber()
  budget: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: 'ACTIVE', enum: status, description: 'Status' })
  @IsEnum(status)
  @IsOptional()
  status?: status;

  @ApiProperty({ example: 1, description: 'campaign ID' })
  @IsInt()
  @IsOptional()
  @IsEitherOne('walmart_tagId', {
    message: 'Either campaign_id or walmart_tagId must be provided, but not both.',
  })
  campaign_id?: number;

  @ApiProperty({ example: 1, description: 'tag ID' })
  @IsInt()
  @IsOptional()
  @IsEitherOne('campaign_id', {
    message: 'Either walmart_tagId or campaign_id must be provided, but not both.',
  })
  walmart_tagId?: number;

  brandId: number;

  @ApiProperty({
    example: period_type.MONTHLY,
    enum: period_type,
    description: 'date type',
    default: period_type.DAILY,
  })
  @IsEnum(period_type)
  period_type: period_type;
}

export class UpdateBudgetDto extends BaseUpdateDto {
  @ApiProperty({ example: 5, description: 'Budget id' })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 500.0, description: 'Budget amount' })
  @IsNumber()
  @IsOptional()
  budget: number;

  @ApiProperty({ example: 1, description: 'tag ID' })
  @IsInt()
  @IsOptional()
  @IsEitherOne('campaign_id', {
    message: 'Either walmart_tagId or campaign_id must be provided, but not both.',
  })
  walmart_tagId?: number;

  brandId: number;

  @ApiProperty({ example: 'ACTIVE', enum: status, description: 'Status' })
  @IsEnum(status)
  @IsOptional()
  status?: status;
}
