import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { addresses } from '../db/schemas/addresses.js';
import { eq, and } from 'drizzle-orm';
import { DB_CLIENT } from '../db/db.module.js';
import { GrpcClientService } from '../grpc/grpc-client.service.js';
import type { Db } from '../db/index.js';
import type { CreateAddressDto } from './dto/create-address.dto.js';
import type { UpdateAddressDto } from './dto/update-address.dto.js';

@Injectable()
export class AddressesService {
  constructor(
    @Inject(DB_CLIENT) private db: Db,
    private readonly grpcClient: GrpcClientService,
  ) {}

  // Get all addresses for a user
  async findAll(userId: string) {
    return this.db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(addresses.createdAt);
  }

  // Get single address
  async findOne(userId: string, addressId: string) {
    const [address] = await this.db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  // Get default address
  async getDefault(userId: string) {
    const [address] = await this.db
      .select()
      .from(addresses)
      .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)))
      .limit(1);

    return address || null;
  }

  // Validate pincode via gRPC
  async validatePincode(pincode: string) {
    console.log('[AddressesService] Validating pincode:', pincode);

    try {
      const response = await this.grpcClient.getDeliveryZoneByPincode({ pincode });
      const zone = response.delivery_zone;

      console.log('[AddressesService] Delivery zone found:', {
        pincode: zone.pincode,
        city: zone.city,
        state: zone.state,
        is_serviceable: zone.is_serviceable,
        eta_days: zone.eta_days,
        delivery_charge: zone.delivery_charge,
      });

      return {
        valid: true,
        serviceable: zone.is_serviceable,
        city: zone.city,
        state: zone.state,
        etaDays: zone.eta_days,
        deliveryCharge: zone.delivery_charge,
      };
    } catch (error) {
      console.log('[AddressesService] Pincode not serviceable:', pincode);
      return {
        valid: false,
        serviceable: false,
        city: null,
        state: null,
        etaDays: null,
        deliveryCharge: null,
      };
    }
  }

  // Create new address
  async create(userId: string, dto: CreateAddressDto) {
    console.log('[AddressesService] Creating address for user:', userId);

    // Validate pincode via gRPC
    const validation = await this.validatePincode(dto.pincode);

    if (!validation.valid || !validation.serviceable) {
      throw new BadRequestException(
        `Delivery is not available for pincode ${dto.pincode}. Please enter a serviceable pincode.`
      );
    }

    // If this is set as default, unset other default addresses
    if (dto.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    // If this is the first address, make it default
    const existing = await this.db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId));

    const shouldBeDefault = dto.isDefault || existing.length === 0;

    const [newAddress] = await this.db
      .insert(addresses)
      .values({
        userId,
        fullName: dto.fullName,
        phone: dto.phone,
        addressLine: dto.addressLine,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        isDefault: shouldBeDefault,
      })
      .returning();

    console.log('[AddressesService] Address created:', newAddress.id);

    return {
      ...newAddress,
      deliveryInfo: {
        etaDays: validation.etaDays,
        deliveryCharge: validation.deliveryCharge,
      },
    };
  }

  // Update address
  async update(userId: string, addressId: string, dto: UpdateAddressDto) {
    console.log('[AddressesService] Updating address:', addressId);

    // Verify ownership
    const [existing] = await this.db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    // If pincode is being updated, validate it
    let deliveryInfo: { etaDays: number; deliveryCharge: number } | undefined = undefined;
    if (dto.pincode && dto.pincode !== existing.pincode) {
      const validation = await this.validatePincode(dto.pincode);

      if (!validation.valid || !validation.serviceable) {
        throw new BadRequestException(
          `Delivery is not available for pincode ${dto.pincode}. Please enter a serviceable pincode.`
        );
      }

      deliveryInfo = {
        etaDays: validation.etaDays!,
        deliveryCharge: validation.deliveryCharge!,
      };
    }

    // If setting as default, clear other defaults
    if (dto.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.addressLine !== undefined) updateData.addressLine = dto.addressLine;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.state !== undefined) updateData.state = dto.state;
    if (dto.pincode !== undefined) updateData.pincode = dto.pincode;
    if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;

    const [updated] = await this.db
      .update(addresses)
      .set(updateData)
      .where(eq(addresses.id, addressId))
      .returning();

    return {
      ...updated,
      deliveryInfo,
    };
  }

  // Set as default address
  async setDefault(userId: string, addressId: string) {
    // Verify ownership
    const [existing] = await this.db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    // Clear other defaults
    await this.clearDefaultAddress(userId);

    // Set this as default
    const [updated] = await this.db
      .update(addresses)
      .set({ isDefault: true })
      .where(eq(addresses.id, addressId))
      .returning();

    return updated;
  }

  // Delete address
  async remove(userId: string, addressId: string) {
    // Verify ownership
    const [existing] = await this.db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    const [deleted] = await this.db
      .delete(addresses)
      .where(eq(addresses.id, addressId))
      .returning();

    // If deleted address was default, set another as default
    if (deleted.isDefault) {
      const [nextAddress] = await this.db
        .select()
        .from(addresses)
        .where(eq(addresses.userId, userId))
        .limit(1);

      if (nextAddress) {
        await this.db
          .update(addresses)
          .set({ isDefault: true })
          .where(eq(addresses.id, nextAddress.id));
      }
    }

    return deleted;
  }

  // Helper: Clear default address for user
  private async clearDefaultAddress(userId: string) {
    await this.db
      .update(addresses)
      .set({ isDefault: false })
      .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
  }
}
