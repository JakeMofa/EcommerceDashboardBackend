import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class WalmartCampaignDto {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Campaign Name', description: 'Campaign name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Type A', description: 'Campaign type' })
  @IsString()
  @IsOptional()
  campaign_type?: string;

  @ApiProperty({ example: 'Type B', description: 'Targeting type' })
  @IsString()
  @IsOptional()
  targeting_type?: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Campaign status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'BUDGET TYPE', description: 'Budget type' })
  @IsString()
  @IsOptional()
  budget_type?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.999Z', description: 'End date' })
  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @ApiProperty({ example: 1000.0, description: 'Total budget' })
  @IsNumber()
  total_budget: number;

  @ApiProperty({ example: 100.0, description: 'Daily budget' })
  @IsNumber()
  daily_budget: number;

  @ApiProperty({ example: true, description: 'Rollover flag' })
  @IsBoolean()
  @IsOptional()
  rollover?: boolean;

  @ApiProperty({ example: 1, description: 'Brand ID' })
  @IsInt()
  brandId: number;

  @ApiProperty({ example: [1, 2], description: 'Array of tag IDs' })
  @IsInt({ each: true })
  tags: number[];
}
