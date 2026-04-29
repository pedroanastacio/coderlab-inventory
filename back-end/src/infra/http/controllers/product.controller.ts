import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateProductUseCase } from '../../../application/use-cases/product/create-product.use-case';
import { FindProductByIdUseCase } from '../../../application/use-cases/product/find-product-by-id.use-case';
import { FindAllProductsUseCase } from '../../../application/use-cases/product/find-all-products.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/product/update-product.use-case';
import { CreateProductDto } from '../dtos/product/create-product.dto';
import { FindProductByIdParamsDto } from '../dtos/product/find-product-by-id-params.dto';
import {
  FindAllProductsDto,
  FindProductSortField,
} from '../dtos/product/find-all-products.dto';
import { UpdateProductDto } from '../dtos/product/update-product.dto';
import { UpdateProductParamsDto } from '../dtos/product/update-product-params.dto';
import { ProductResponseDto } from '../dtos/product/product-response.dto';
import { ProductMapper } from '../mappers/product-mapper.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { SortOrder } from '../../../shared/types';
import { ApiPaginatedResponse } from '../decorators/api-paginated-response.decorator';

@Controller('product')
@ApiTags('product')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ProductResponseDto })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.createProductUseCase.execute(createProductDto);

    return ProductMapper.toDto(product);
  }

  @Get()
  @ApiQuery({ name: 'query', required: false, type: 'string' })
  @ApiQuery({
    name: 'categoryIds',
    required: false,
    type: 'array',
    items: { type: 'string', format: 'uuid' },
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
    enum: FindProductSortField,
    default: FindProductSortField.CREATED_AT,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @ApiPaginatedResponse(ProductResponseDto)
  async findAll(
    @Query() findAllProductsDto: FindAllProductsDto,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    const { query, categoryIds, page, perPage, sortBy, sortOrder } =
      findAllProductsDto;

    const result = await this.findAllProductsUseCase.execute({
      filters: { query: query, categoryIds: categoryIds },
      pagination: { page, perPage },
      sort: { sortBy, sortOrder },
    });

    return {
      data: result.data.map((p) => ProductMapper.toDto(p)),
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  async findById(
    @Param() params: FindProductByIdParamsDto,
  ): Promise<ProductResponseDto> {
    const product = await this.findProductByIdUseCase.execute({
      id: params.id,
    });

    return ProductMapper.toDto(product);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  async update(
    @Param() params: UpdateProductParamsDto,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.updateProductUseCase.execute({
      id: params.id,
      data: updateProductDto,
    });

    return ProductMapper.toDto(product);
  }
}
