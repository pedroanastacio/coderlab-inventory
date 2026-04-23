import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CreateCategoryUseCase } from '../../../application/use-cases/create-category.use-case';
import { FindCategoryByIdUseCase } from '../../../application/use-cases/find-category-by-id.use-case';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { FindCategoryByIdParamsDto } from '../dtos/find-category-by-id-params.dto';
import { CategoryResponseDto } from '../dtos/category-response.dto';
import { CategoryMapper } from '../mappers/category-mapper.dto';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly findCategoryByIdUseCase: FindCategoryByIdUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: CategoryResponseDto })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category =
      await this.createCategoryUseCase.execute(createCategoryDto);

    return CategoryMapper.toDto(category);
  }

  @Get(':id')
  @ApiOkResponse({ type: CategoryResponseDto })
  async findById(
    @Param() params: FindCategoryByIdParamsDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.findCategoryByIdUseCase.execute({
      id: params.id,
    });

    return CategoryMapper.toDto(category);
  }
}
