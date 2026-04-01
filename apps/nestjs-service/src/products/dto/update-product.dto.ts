import { IsString, IsOptional, IsInt, Min, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @Min(2, { message: 'Name must be at least 2 characters' })
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  stock?: number;
}
