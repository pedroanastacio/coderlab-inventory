import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ProductResponseDto {
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

  @IsNumber()
  @ApiProperty({ type: 'number' })
  price!: number;

  @IsUUID('4', { each: true })
  @ApiProperty({ type: 'string', format: 'uuid', isArray: true })
  categoryIds!: string[];

  @IsDateString()
  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;

  @IsDateString()
  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: Date;
}
