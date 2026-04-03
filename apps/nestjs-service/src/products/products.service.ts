import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { products, PRODUCT_CATEGORIES } from '../db/schemas/products.js';
import { eq, and, sql, desc, asc, inArray } from 'drizzle-orm';
import { DB_CLIENT } from '../db/db.module.js';
import type { Db } from '../db/index.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { UpdateProductDto } from './dto/update-product.dto.js';

export interface ProductQueryParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

@Injectable()
export class ProductsService {
  constructor(@Inject(DB_CLIENT) private db: Db) {}

  // Find all products with filtering and pagination
  async findAll(params: ProductQueryParams = {}) {
    const {
      category,
      minPrice,
      maxPrice,
      inStock,
      isActive = true,
      isFeatured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
    } = params;

    // Build conditions
    const conditions: any[] = [];

    if (isActive !== undefined) {
      conditions.push(eq(products.isActive, isActive));
    }

    if (category && PRODUCT_CATEGORIES.includes(category as any)) {
      conditions.push(eq(products.category, category));
    }

    if (isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, isFeatured));
    }

    if (inStock !== undefined && inStock) {
      conditions.push(sql`${products.stock} > 0`);
    }

    if (minPrice !== undefined) {
      conditions.push(sql`${products.price} >= ${minPrice}`);
    }

    if (maxPrice !== undefined) {
      conditions.push(sql`${products.price} <= ${maxPrice}`);
    }

    if (search) {
      conditions.push(
        sql`(${products.name} ILIKE ${`%${search}%`} OR ${products.description} ILIKE ${`%${search}%`})`
      );
    }

    // Build query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort column
    const sortColumn = sortBy === 'price' ? products.price :
                       sortBy === 'name' ? products.name :
                       products.createdAt;

    const orderFn = sortOrder === 'asc' ? asc : desc;

    const results = await this.db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    return {
      data: results,
      pagination: {
        total: Number(count),
        limit,
        offset,
        hasMore: offset + limit < Number(count),
      },
    };
  }

  // Find one product by ID
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

  // Find featured products
  async findFeatured(limit: number = 8) {
    return this.db
      .select()
      .from(products)
      .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt))
      .limit(limit);
  }

  // Find products by category
  async findByCategory(category: string, limit: number = 20) {
    if (!PRODUCT_CATEGORIES.includes(category as any)) {
      throw new NotFoundException(`Category '${category}' not found`);
    }

    return this.db
      .select()
      .from(products)
      .where(and(eq(products.category, category), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt))
      .limit(limit);
  }

  // Search products
  async search(query: string, limit: number = 10) {
    return this.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          sql`(${products.name} ILIKE ${`%${query}%`} OR ${products.description} ILIKE ${`%${query}%`})`
        )
      )
      .orderBy(desc(products.createdAt))
      .limit(limit);
  }

  // Get all categories with product counts
  async getCategories() {
    const results = await this.db
      .select({
        category: products.category,
        count: sql<number>`count(*)`,
      })
      .from(products)
      .where(eq(products.isActive, true))
      .groupBy(products.category);

    return PRODUCT_CATEGORIES.map((cat) => {
      const found = results.find((r) => r.category === cat);
      return {
        name: cat,
        count: found ? Number(found.count) : 0,
      };
    });
  }

  // Create product
  async create(dto: CreateProductDto) {
    const now = new Date();
    const [newProduct] = await this.db
      .insert(products)
      .values({
        name: dto.name,
        description: dto.description ?? null,
        imageUrl: dto.imageUrl ?? null,
        category: dto.category ?? 'general',
        price: dto.price.toString(),
        compareAtPrice: dto.compareAtPrice?.toString() ?? null,
        stock: dto.stock,
        sku: dto.sku ?? null,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        updatedAt: now,
      })
      .returning();

    return newProduct;
  }

  // Update product
  async update(id: string, dto: UpdateProductDto) {
    const [existing] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.price !== undefined) updateData.price = dto.price.toString();
    if (dto.compareAtPrice !== undefined) updateData.compareAtPrice = dto.compareAtPrice.toString();
    if (dto.stock !== undefined) updateData.stock = dto.stock;
    if (dto.sku !== undefined) updateData.sku = dto.sku;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) updateData.isFeatured = dto.isFeatured;

    const [updated] = await this.db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    return updated;
  }

  // Delete product
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

  // Bulk update stock
  async updateStock(items: { id: string; stock: number }[]) {
    const ids = items.map((item) => item.id);

    const results = await Promise.all(
      items.map((item) =>
        this.db
          .update(products)
          .set({ stock: item.stock, updatedAt: new Date() })
          .where(eq(products.id, item.id))
          .returning()
      )
    );

    return results.map((r) => r[0]);
  }
}
