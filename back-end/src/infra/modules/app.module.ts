import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma/prisma.module';
import { CategoryModule } from './category.module';

@Module({
  imports: [PrismaModule, CategoryModule],
})
export class AppModule {}
