import {
  pgTable,
  pgEnum,
  uuid,
  text,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { addresses } from './addresses.js';

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  addressId: uuid('address_id').references(() => addresses.id),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  totalAmount: numeric('total_amount').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
