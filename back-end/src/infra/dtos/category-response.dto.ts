import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

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
}
