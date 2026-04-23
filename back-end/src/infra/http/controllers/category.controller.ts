import { Body, Controller, Post } from '@nestjs/common';

import { ApiCreatedResponse } from '@nestjs/swagger';
import { CreateCategoryUseCase } from '../../../application/use-cases/create-category.use-case';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { CategoryResponseDto } from '../dtos/category-response.dto';
import { CategoryMapper } from '../mappers/category-mapper.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly createCategoryUseCase: CreateCategoryUseCase) {}

  @Post()
  @ApiCreatedResponse({ type: CategoryResponseDto })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category =
      await this.createCategoryUseCase.execute(createCategoryDto);

    return CategoryMapper.toDto(category);
  }
}
