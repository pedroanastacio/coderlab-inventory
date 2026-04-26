import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsObject } from 'class-validator';
import type { PaginationParams } from '../../../shared/types';

export class PaginatedResponseDto<T> {
  @IsArray()
  @ApiProperty({ type: 'array', items: {} })
  data!: T[];

  @IsObject()
  @Type(() => Object)
  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'integer' },
      page: { type: 'integer', minimum: 1, default: 1 },
      perPage: { type: 'integer', minimum: 1, default: 10 },
      pageCount: { type: 'integer' },
    },
  })
  pagination!: PaginationParams;
}
