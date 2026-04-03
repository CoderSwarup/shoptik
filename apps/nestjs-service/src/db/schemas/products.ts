import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  category: text('category').default('general'),
  price: numeric('price').notNull(),
  compareAtPrice: numeric('compare_at_price'),
  stock: integer('stock').default(0),
  sku: text('sku'),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// Product categories
export const PRODUCT_CATEGORIES = [
  'electronics',
  'clothing',
  'accessories',
  'home',
  'sports',
  'books',
  'toys',
  'general',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
