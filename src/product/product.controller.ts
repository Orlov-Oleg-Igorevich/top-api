import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductDocument } from './product.model';
import { FindProductDto } from './dto/find-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { NOT_FOUND_PRODUCT_EXCEPTION } from './product.constans';
import { type UnpackedFn } from 'src/utils/unpacked-fn.utils';
import { IdValidationPipes } from '../../src/pipes/id-validation.pipes';
import { JwtAuthGuard } from '../../src/auth/guards/jwt.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() dto: CreateProductDto): Promise<ProductDocument> {
    return this.productService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id', IdValidationPipes) id: string): Promise<ProductDocument> {
    const product = await this.productService.findById(id);
    if (!product) {
      throw new NotFoundException(NOT_FOUND_PRODUCT_EXCEPTION);
    }
    return product;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', IdValidationPipes) id: string): Promise<ProductDocument> {
    const deletedProduct = await this.productService.deleteById(id);
    if (!deletedProduct) {
      throw new NotFoundException(NOT_FOUND_PRODUCT_EXCEPTION);
    }
    return deletedProduct;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async patch(
    @Param('id', IdValidationPipes) id: string,
    @Body() dto: Partial<CreateProductDto>,
  ): Promise<ProductDocument> {
    const updatedProduct = await this.productService.updateProductById(id, dto);
    if (!updatedProduct) {
      throw new NotFoundException(NOT_FOUND_PRODUCT_EXCEPTION);
    }
    return updatedProduct;
  }

  @HttpCode(200)
  @Post('find')
  async find(@Body() dto: FindProductDto): UnpackedFn<ProductService['findByReviews']> {
    return this.productService.findByReviews(dto);
  }
}
