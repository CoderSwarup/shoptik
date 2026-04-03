import { IsString, IsOptional, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  fullName?: string;

  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'Phone must be at least 10 digits' })
  @MaxLength(15, { message: 'Phone must be at most 15 digits' })
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  addressLine?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  @MinLength(4, { message: 'Pincode must be at least 4 characters' })
  @MaxLength(10, { message: 'Pincode must be at most 10 characters' })
  pincode?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
