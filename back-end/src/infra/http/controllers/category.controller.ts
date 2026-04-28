import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { CreateCategoryUseCase } from '../../../application/use-cases/create-category.use-case';
import { FindCategoryByIdUseCase } from '../../../application/use-cases/find-category-by-id.use-case';
import { FindAllCategoriesUseCase } from '../../../application/use-cases/find-all-categories.use-case';
import { UpdateCategoryUseCase } from '../../../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../../application/use-cases/delete-category.use-case';
import { CreateCategoryDto } from '../dtos/category/create-category.dto';
import { FindCategoryByIdParamsDto } from '../dtos/category/find-category-by-id-params.dto';
import {
  FindAllCategoriesDto,
  FindCategorySortField,
} from '../dtos/category/find-all-categories.dto';
import { UpdateCategoryDto } from '../dtos/category/update-category.dto';
import { CategoryResponseDto } from '../dtos/category/category-response.dto';
import { CategoryMapper } from '../mappers/category-mapper.dto';
import { UpdateCategoryParamsDto } from '../dtos/category/update-category-params.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { SortOrder } from '../../../shared/types';
import { ApiPaginatedResponse } from '../decorators/api-paginated-response.decorator';
import { DeleteCategoryParamsDto } from '../dtos/category/delete-category-params.dto';

@Controller('category')
@ApiTags('category')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly findCategoryByIdUseCase: FindCategoryByIdUseCase,
    private readonly findAllCategoriesUseCase: FindAllCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
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

  @Get()
  @ApiQuery({ name: 'query', required: false, type: 'string' })
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'integer',
    minimum: 1,
    default: 1,
  })
  @ApiQuery({ name: 'perPage', required: false, type: 'integer', default: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: FindCategorySortField,
    default: FindCategorySortField.CREATED_AT,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @ApiPaginatedResponse(CategoryResponseDto)
  async findAll(
    @Query() findAllCategoriesDto: FindAllCategoriesDto,
  ): Promise<PaginatedResponseDto<CategoryResponseDto>> {
    const { query, parentId, page, perPage, sortBy, sortOrder } =
      findAllCategoriesDto;

    const result = await this.findAllCategoriesUseCase.execute({
      filters: { query: query, parentId: parentId },
      pagination: { page, perPage },
      sort: { sortBy, sortOrder },
    });

    return {
      data: result.data.map((c) => CategoryMapper.toDto(c)),
      pagination: result.pagination,
    };
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

  @Delete(':id')
  @ApiNoContentResponse()
  async delete(@Param() params: DeleteCategoryParamsDto): Promise<void> {
    await this.deleteCategoryUseCase.execute({ id: params.id });
  }
}
