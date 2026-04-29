import { ApiProperty } from '@nestjs/swagger';
import { Trim } from 'class-sanitizer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Trim()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: false })
  name!: string;

  @IsOptional()
  @IsString()
  @Trim()
  @ApiProperty({ type: 'string', nullable: true, required: false })
  description?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ type: 'number', minimum: 0, required: false })
  price?: number;

  @IsOptional()
  @IsUUID('4', { each: true })
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    isArray: true,
    required: false,
  })
  categoryIds?: string[];
}
