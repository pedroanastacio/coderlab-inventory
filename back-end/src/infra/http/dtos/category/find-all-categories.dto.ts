import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from '../../../../shared/types/sort-params.types';
import {
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FindCategorySortField {
  NAME = 'name',
  DESCRIPTION = 'description',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class FindAllCategoriesDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', required: false })
  query?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    required: false,
  })
  parentId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(0)
  @ApiProperty({ type: 'integer', minimum: 1, default: 1 })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  @ApiProperty({ type: 'integer', minimum: 1, default: 10 })
  perPage: number = 10;

  @IsOptional()
  @IsEnum(FindCategorySortField)
  @ApiProperty({
    enum: FindCategorySortField,
    default: FindCategorySortField.CREATED_AT,
  })
  sortBy: string = FindCategorySortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiProperty({ enum: SortOrder, default: SortOrder.ASC })
  sortOrder: SortOrder = SortOrder.ASC;
}
