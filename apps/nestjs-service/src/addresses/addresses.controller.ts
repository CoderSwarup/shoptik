import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Headers,
  Query,
} from '@nestjs/common';
import { AddressesService } from './addresses.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  // GET /addresses/validate-pincode?pincode=560001 - Validate pincode
  @Get('validate-pincode')
  async validatePincode(@Query('pincode') pincode: string) {
    return this.addressesService.validatePincode(pincode);
  }

  // GET /addresses - Get all addresses for user
  @Get()
  async findAll(@Headers('x-user-id') userId: string) {
    return this.addressesService.findAll(userId);
  }

  // GET /addresses/default - Get default address
  @Get('default')
  async getDefault(@Headers('x-user-id') userId: string) {
    return this.addressesService.getDefault(userId);
  }

  // GET /addresses/:id - Get single address
  @Get(':id')
  async findOne(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.addressesService.findOne(userId, id);
  }

  // POST /addresses - Create new address
  @Post()
  async create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.create(userId, dto);
  }

  // PUT /addresses/:id - Update address
  @Put(':id')
  async update(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(userId, id, dto);
  }

  // PUT /addresses/:id/default - Set as default
  @Put(':id/default')
  async setDefault(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.addressesService.setDefault(userId, id);
  }

  // DELETE /addresses/:id - Delete address
  @Delete(':id')
  async remove(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.addressesService.remove(userId, id);
  }
}
