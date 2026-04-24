import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateCategoryUseCase } from '../../../application/use-cases/create-category.use-case';
import { FindCategoryByIdUseCase } from '../../../application/use-cases/find-category-by-id.use-case';
import { UpdateCategoryUseCase } from '../../../application/use-cases/update-category.use-case';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { FindCategoryByIdParamsDto } from '../dtos/find-category-by-id-params.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { CategoryResponseDto } from '../dtos/category-response.dto';
import { CategoryMapper } from '../mappers/category-mapper.dto';
import { UpdateCategoryParamsDto } from '../dtos/update-category-params.dto';

@Controller('category')
@ApiTags('category')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly findCategoryByIdUseCase: FindCategoryByIdUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
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

  @Patch(':id')
  @ApiOkResponse({ type: CategoryResponseDto })
  async update(
    @Param() params: UpdateCategoryParamsDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.updateCategoryUseCase.execute({
      id: params.id,
      data: updateCategoryDto,
    });

    return CategoryMapper.toDto(category);
  }
}
