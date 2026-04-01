import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { products } from '../db/schemas/products.js';
import { eq } from 'drizzle-orm';
import { DB_CLIENT } from '../db/db.module.js';
import type { Db } from '../db/index.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(@Inject(DB_CLIENT) private db: Db) {}

  async findAll() {
    return this.db.select().from(products).orderBy(products.createdAt);
  }

  async findOne(id: string) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const [newProduct] = await this.db
      .insert(products)
      .values({
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price.toString(),
        stock: dto.stock,
      })
      .returning();

    return newProduct;
  }

  async update(id: string, dto: UpdateProductDto) {
    const [existing] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = dto.price.toString();
    if (dto.stock !== undefined) updateData.stock = dto.stock;

    const [updated] = await this.db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    const [deleted] = await this.db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return deleted;
  }
}
