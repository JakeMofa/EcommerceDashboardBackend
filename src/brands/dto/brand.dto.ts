import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { WalmartCampaignDto } from 'src/budget-management/dto/campaign.dto';
import { WalmartTagDto } from 'src/budget-management/dto/tag.dto';

export class BrandsResponseDto {
  @ApiProperty({ example: 1, description: 'The brand ID' })
  id: number;

  @ApiProperty({ example: 'Brand Name', description: 'The name of the brand' })
  name: string;

  @ApiProperty({ type: [WalmartTagDto], description: 'The related Walmart tags' })
  @ValidateNested({ each: true })
  @Type(() => WalmartTagDto)
  @IsOptional()
  tags?: WalmartTagDto[];

  @ApiProperty({ type: [WalmartCampaignDto], description: 'The related Walmart campaigns' })
  @ValidateNested({ each: true })
  @Type(() => WalmartCampaignDto)
  @IsOptional()
  campaigns?: WalmartCampaignDto[];
}
