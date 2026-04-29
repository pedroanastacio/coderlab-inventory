import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductUseCase } from '../../../application/use-cases/product/create-product.use-case';
import { CreateProductDto } from '../dtos/product/create-product.dto';
import { ProductResponseDto } from '../dtos/product/product-response.dto';
import { ProductMapper } from '../mappers/product-mapper.dto';

@Controller('product')
@ApiTags('product')
export class ProductController {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  @Post()
  @ApiCreatedResponse({ type: ProductResponseDto })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.createProductUseCase.execute(createProductDto);

    return ProductMapper.toDto(product);
  }
}
