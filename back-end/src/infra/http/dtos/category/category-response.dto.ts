import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryParentDto {
  @IsUUID()
  @ApiProperty({ type: 'string', format: 'uuid' })
  id!: string;

  @IsString()
  @ApiProperty({ type: 'string' })
  name!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', nullable: true, required: false })
  description?: string | null;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    nullable: true,
    required: false,
  })
  parentId?: string | null;

  @IsDateString()
  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;

  @IsDateString()
  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: Date;
}

export class CategoryResponseDto {
  @IsUUID()
  @ApiProperty({ type: 'string', format: 'uuid' })
  id!: string;

  @IsString()
  @ApiProperty({ type: 'string' })
  name!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', nullable: true, required: false })
  description?: string | null;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    nullable: true,
    required: false,
  })
  parentId?: string | null;

  @ValidateNested()
  @Type(() => CategoryParentDto)
  @ApiProperty({ type: CategoryParentDto, nullable: true, required: false })
  parent?: CategoryParentDto | null;

  @IsDateString()
  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;

  @IsDateString()
  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: Date;
}
