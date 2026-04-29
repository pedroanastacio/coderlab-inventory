import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma/prisma.module';
import { CategoryModule } from './category.module';
import { ProductModule } from './product.module';

@Module({
  imports: [PrismaModule, CategoryModule, ProductModule],
})
export class AppModule {}
