import { IsDateString, IsOptional, ValidateNested } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BaseCreateDto {
  @ApiProperty({ example: '2024-05-20T00:00:00.000Z', description: 'Creation date' })
  @IsDateString()
  @Transform(() => new Date().toISOString())
  @Type(() => String)
  created_at: string = new Date().toISOString();

  @ApiProperty({ example: '2024-05-21T00:00:00.000Z', description: 'Last update date' })
  @IsDateString()
  @Transform(() => new Date().toISOString())
  @Type(() => String)
  updated_at: string = new Date().toISOString();

  // constructor() {
  //   const now = new Date();
  //   this.created_at = now.toISOString();
  //   this.updated_at = now.toISOString();
  // }
}

export class BaseUpdateDto {
  @ApiProperty({ example: '2024-05-21T00:00:00.000Z', description: 'Last update date' })
  @IsDateString()
  @Expose({ toClassOnly: true })
  @Transform(({ value }) => value || new Date().toISOString())
  readonly updated_at: string;
}

export class BaseRelationDto<CreateDTO, ConnectDTO> {
  @ApiProperty({ description: 'Create related entity data', type: () => Object as CreateDTO })
  @IsOptional()
  @ValidateNested()
  @Type((type) => type?.newObject.constructor)
  create?: CreateDTO;

  @ApiProperty({ description: 'Create related entity data', type: () => Object as ConnectDTO })
  @IsOptional()
  @ValidateNested()
  @Type((options) => options?.newObject.constructor)
  connect?: ConnectDTO;
}
