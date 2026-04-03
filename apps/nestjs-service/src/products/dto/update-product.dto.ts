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

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name?: string;

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
  @IsOptional()
  @Min(0, { message: 'Price must be at least 0' })
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Compare at price must be at least 0' })
  compareAtPrice?: number;

  @IsInt()
  @IsOptional()
  @Min(0, { message: 'Stock must be at least 0' })
  stock?: number;

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
