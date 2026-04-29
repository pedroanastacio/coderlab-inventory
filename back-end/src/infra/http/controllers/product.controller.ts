import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductUseCase } from '../../../application/use-cases/product/create-product.use-case';
import { FindProductByIdUseCase } from '../../../application/use-cases/product/find-product-by-id.use-case';
import { CreateProductDto } from '../dtos/product/create-product.dto';
import { FindProductByIdParamsDto } from '../dtos/product/find-product-by-id-params.dto';
import { ProductResponseDto } from '../dtos/product/product-response.dto';
import { ProductMapper } from '../mappers/product-mapper.dto';

@Controller('product')
@ApiTags('product')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
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
}
