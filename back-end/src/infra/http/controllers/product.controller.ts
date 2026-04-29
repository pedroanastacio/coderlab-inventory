import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductUseCase } from '../../../application/use-cases/product/create-product.use-case';
import { FindProductByIdUseCase } from '../../../application/use-cases/product/find-product-by-id.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/product/update-product.use-case';
import { CreateProductDto } from '../dtos/product/create-product.dto';
import { FindProductByIdParamsDto } from '../dtos/product/find-product-by-id-params.dto';
import { UpdateProductDto } from '../dtos/product/update-product.dto';
import { UpdateProductParamsDto } from '../dtos/product/update-product-params.dto';
import { ProductResponseDto } from '../dtos/product/product-response.dto';
import { ProductMapper } from '../mappers/product-mapper.dto';

@Controller('product')
@ApiTags('product')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
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
