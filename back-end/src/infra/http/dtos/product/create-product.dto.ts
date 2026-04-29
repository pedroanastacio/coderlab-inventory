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

export class CreateProductDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @ApiProperty({ type: 'string' })
  name!: string;

  @IsOptional()
  @IsString()
  @Trim()
  @ApiProperty({ type: 'string', nullable: true, required: false })
  description?: string | null;

  @IsNumber()
  @Min(0)
  @ApiProperty({ type: 'number' })
  price!: number;

  @IsUUID('4', { each: true })
  @ApiProperty({ type: 'string', format: 'uuid', isArray: true })
  categoryIds!: string[];
}
