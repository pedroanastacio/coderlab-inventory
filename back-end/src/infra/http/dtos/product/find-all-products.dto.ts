import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from '../../../../shared/types/sort-params.types';
import {
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  Min,
  IsEnum,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum FindProductSortField {
  NAME = 'name',
  DESCRIPTION = 'description',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class FindAllProductsDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', required: false })
  query?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }: { value: string }) =>
    Array.isArray(value) ? value : [value],
  )
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
    required: false,
    example: ['uuid1', 'uuid2'],
  })
  categoryIds?: string[];

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
  @IsEnum(FindProductSortField)
  @ApiProperty({
    enum: FindProductSortField,
    default: FindProductSortField.CREATED_AT,
  })
  sortBy: string = FindProductSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiProperty({ enum: SortOrder, default: SortOrder.ASC })
  sortOrder: SortOrder = SortOrder.ASC;
}
