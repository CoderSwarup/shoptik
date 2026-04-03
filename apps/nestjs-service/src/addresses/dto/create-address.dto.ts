import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @MinLength(10, { message: 'Phone must be at least 10 digits' })
  @MaxLength(15, { message: 'Phone must be at most 15 digits' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  addressLine: string;

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'Pincode is required' })
  @MinLength(4, { message: 'Pincode must be at least 4 characters' })
  @MaxLength(10, { message: 'Pincode must be at most 10 characters' })
  pincode: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
