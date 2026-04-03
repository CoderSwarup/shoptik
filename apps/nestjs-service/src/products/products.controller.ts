import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/guards/roles.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ProductsService, ProductQueryParams } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products - List all products with filtering
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'price' | 'createdAt' | 'name',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const params: ProductQueryParams = {
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStock: inStock === 'true',
      search,
      sortBy,
      sortOrder,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    };

    return this.productsService.findAll(params);
  }

  // GET /products/featured - Get featured products
  @Get('featured')
  async getFeatured(@Query('limit') limit?: string) {
    return this.productsService.findFeatured(limit ? parseInt(limit) : 8);
  }

  // GET /products/categories - Get all categories
  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  // GET /products/search - Search products
  @Get('search')
  async search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.productsService.search(query, limit ? parseInt(limit) : 10);
  }

  // GET /products/category/:category - Get products by category
  @Get('category/:category')
  async getByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.findByCategory(category, limit ? parseInt(limit) : 20);
  }

  // GET /products/:id - Get single product
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // POST /products - Create product (Admin only)
  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // PUT /products/:id - Update product (Admin only)
  @Put(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  // DELETE /products/:id - Delete product (Admin only)
  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // PUT /products/bulk/stock - Bulk update stock (Admin only)
  @Put('bulk/stock')
  @Roles('ADMIN')
  async updateStock(@Body() items: { id: string; stock: number }[]) {
    return this.productsService.updateStock(items);
  }
}
