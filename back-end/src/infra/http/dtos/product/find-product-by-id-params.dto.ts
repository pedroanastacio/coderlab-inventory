import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindProductByIdParamsDto {
  @IsUUID()
  @ApiProperty({ type: 'string', format: 'uuid' })
  id!: string;
}
