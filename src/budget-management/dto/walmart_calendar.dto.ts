import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { status, calendar_type } from 'prisma/commerce/generated/vendoCommerce';
import { BaseCreateDto, BaseUpdateDto } from 'src/types/base.dto';

export class WalmartCalendarDto {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Holiday Campaign', description: 'Calendar name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.999Z', description: 'End date' })
  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @ApiProperty({ example: 'ACTIVE', enum: status, description: 'Status' })
  @IsEnum(status)
  status: status;

  @ApiProperty({ example: 'CALENDAR', enum: calendar_type, description: 'Calendar type' })
  @IsEnum(calendar_type)
  type: calendar_type;

  @ApiProperty({ example: 10.0, description: 'Budget change value' })
  @IsNumber()
  budget_change: number;

  @ApiProperty({ example: 1, description: 'Brand ID' })
  @IsInt()
  brandId: number;

  @ApiProperty({ example: [1, 2], description: 'Array of tag IDs' })
  @IsInt({ each: true })
  tags: number[];

  @ApiProperty({ example: [1, 2], description: 'Array of calendar period IDs' })
  @IsInt({ each: true })
  periods: number[];
}

export class WalmartCalendarPeriodDto {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @IsInt()
  id: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.999Z', description: 'End date' })
  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @ApiProperty({ example: 10.0, description: 'Budget change value' })
  @IsNumber()
  budget_change: number;

  @ApiProperty({ example: 1, description: 'Calendar ID' })
  @IsInt()
  calendarId: number;
}

export class CreateWalmartCalendarPeriodDto extends BaseCreateDto {
  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.999Z', description: 'End date' })
  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @ApiProperty({ example: 10.0, description: 'Budget change value' })
  @IsNumber()
  budget_change: number;
}
export class UpdateWalmartCalendarPeriodDto extends BaseUpdateDto {
  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  start_date?: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.999Z', description: 'End date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  end_date?: Date;

  @ApiProperty({ example: 10.0, description: 'Budget change value' })
  @IsNumber()
  @IsOptional()
  budget_change?: number;
}
export class CreateWalmartCalendarDto extends BaseCreateDto {
  @ApiProperty({ example: 'Holiday Campaign', description: 'Calendar name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  start_date?: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.999Z', description: 'End date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  end_date?: Date;

  @ApiProperty({ example: 'ACTIVE', enum: status, description: 'Status' })
  @IsEnum(status)
  @IsOptional()
  status?: status;

  @ApiProperty({ example: 'CALENDAR', enum: calendar_type, description: 'Calendar type' })
  @IsEnum(calendar_type)
  @IsOptional()
  type?: calendar_type;

  @ApiProperty({ example: 10.0, description: 'Budget change value' })
  @IsNumber()
  budget_change: number;

  @ApiProperty({ example: [1, 2], description: 'Array of tag IDs' })
  @IsInt({ each: true })
  @IsOptional()
  walmart_tags?: number[];

  @ApiProperty({
    example: [CreateWalmartCalendarPeriodDto],
    description: 'Array of calendar periods',
    type: [CreateWalmartCalendarPeriodDto],
  })
  @Type(() => CreateWalmartCalendarPeriodDto)
  periods: CreateWalmartCalendarPeriodDto[];
}

export class UpdateWalmartCalendarDto extends BaseUpdateDto {
  @ApiProperty({ example: 'Holiday Campaign', description: 'Calendar name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Transform((value) => value ?? new Date(value))
  start_date?: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.999Z', description: 'End date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Transform((value) => value ?? new Date(value))
  end_date?: Date;

  @ApiProperty({ example: 'ACTIVE', enum: status, description: 'Status' })
  @IsEnum(status)
  @IsOptional()
  status?: status;

  @ApiProperty({ example: 'CALENDAR', enum: calendar_type, description: 'Calendar type' })
  @IsEnum(calendar_type)
  @IsOptional()
  type?: calendar_type;

  @ApiProperty({ example: 10.0, description: 'Budget change value' })
  @IsNumber()
  @IsOptional()
  budget_change?: number;

  @ApiProperty({ example: [1, 2], description: 'Array of tag IDs' })
  @IsInt({ each: true })
  @IsOptional()
  walmart_tags?: number[];

  @ApiProperty({
    example: [CreateWalmartCalendarPeriodDto],
    description: 'Array of calendar periods',
    type: [CreateWalmartCalendarPeriodDto],
  })
  @Type(() => CreateWalmartCalendarPeriodDto)
  periods: CreateWalmartCalendarPeriodDto[];
}
