import { IsString, IsOptional, IsInt, Min, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Min(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;
}
