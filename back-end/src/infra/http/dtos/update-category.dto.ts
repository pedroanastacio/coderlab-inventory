import { ApiProperty } from '@nestjs/swagger';
import { Trim } from 'class-sanitizer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
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
  @IsUUID()
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    nullable: true,
    required: false,
  })
  parentId?: string | null;
}
