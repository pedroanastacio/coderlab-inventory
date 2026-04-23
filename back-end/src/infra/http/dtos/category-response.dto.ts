import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

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

  @IsDateString()
  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;

  @IsDateString()
  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: Date;
}
