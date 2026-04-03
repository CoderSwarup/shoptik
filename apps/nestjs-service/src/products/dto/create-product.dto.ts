import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  MinLength,
  IsBoolean,
  IsUrl,
  IsIn,
} from 'class-validator';
import { PRODUCT_CATEGORIES } from '../../db/schemas/products.js';

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'Image must be a valid URL' })
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @IsIn(PRODUCT_CATEGORIES, { message: 'Invalid category' })
  category?: string;

  @IsNumber()
  @Min(0, { message: 'Price must be at least 0' })
  price: number;

  @IsNumber()
  @Min(0, { message: 'Compare at price must be at least 0' })
  @IsOptional()
  compareAtPrice?: number;

  @IsInt()
  @Min(0, { message: 'Stock must be at least 0' })
  stock: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
