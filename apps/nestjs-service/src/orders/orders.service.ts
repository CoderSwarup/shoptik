import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { orders, orderStatusEnum } from '../db/schemas/orders.js';
import { orderItems } from '../db/schemas/order-items.js';
import { payments, paymentStatusEnum } from '../db/schemas/payments.js';
import { products } from '../db/schemas/products.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DB_CLIENT } from '../db/db.module.js';
import type { Db } from '../db/index.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DB_CLIENT) private db: Db,
    private readonly notifications: NotificationsService,
  ) {}

  // Get all orders for user
  async findAll(userId: string) {
    const userOrders = await this.db
      .select({
        id: orders.id,
        userId: orders.userId,
        addressId: orders.addressId,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    // Get items and payment for each order
    const ordersWithDetails = await Promise.all(
      userOrders.map(async (order) => {
        const items = await this.db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            product: {
              id: products.id,
              name: products.name,
              imageUrl: products.imageUrl,
            },
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        const [payment] = await this.db
          .select()
          .from(payments)
          .where(eq(payments.orderId, order.id))
          .limit(1);

        return {
          ...order,
          items,
          payment,
        };
      })
    );

    return ordersWithDetails;
  }

  // Get single order
  async findOne(userId: string, orderId: string) {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const items = await this.db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        product: {
          id: products.id,
          name: products.name,
          imageUrl: products.imageUrl,
        },
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    const [payment] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .limit(1);

    const [address] = await this.db
      .select({
        fullName: sql<string>`full_name`,
        phone: sql<string>`phone`,
        addressLine: sql<string>`address_line`,
        city: sql<string>`city`,
        state: sql<string>`state`,
        pincode: sql<string>`pincode`,
      })
      .from(sql`addresses`)
      .where(eq(sql`id`, order.addressId))
      .limit(1);

    return {
      ...order,
      items,
      payment,
      address,
    };
  }

  // Create order
  async create(userId: string, dto: CreateOrderDto) {
    // Validate stock for all items
    for (const item of dto.items) {
      const [product] = await this.db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      const stock = product.stock ?? 0;
      if (stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${stock}, Requested: ${item.quantity}`
        );
      }
    }

    // Calculate total
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const [order] = await this.db
      .insert(orders)
      .values({
        userId,
        addressId: dto.addressId,
        status: 'PENDING',
        totalAmount: totalAmount.toString(),
      })
      .returning();

    // Create order items
    await this.db.insert(orderItems).values(
      dto.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toString(),
      }))
    );

    // Update product stock
    for (const item of dto.items) {
      await this.db
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }

    // Create pending payment
    await this.db.insert(payments).values({
      orderId: order.id,
      status: 'PENDING',
      method: dto.paymentMethod,
    });

    // Notify user: order placed
    await this.notifications.sendOrderUpdate(
      userId,
      order.id,
      'PENDING',
      `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
    );

    return order;
  }

  // Process payment (mock)
  async processPayment(userId: string, orderId: string, method: 'UPI' | 'CARD' | 'COD') {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Mock payment processing
    // Simulate 90% success rate
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await this.db
        .update(payments)
        .set({
          status: 'SUCCESS',
          transactionId,
        })
        .where(eq(payments.orderId, orderId));

      // Update order status to processing
      await this.db
        .update(orders)
        .set({ status: 'PROCESSING' })
        .where(eq(orders.id, orderId));

      // Notify user: payment success + order processing
      await this.notifications.sendPaymentNotification(userId, orderId, 'SUCCESS', Number(order.totalAmount));
      await this.notifications.sendOrderUpdate(userId, orderId, 'PROCESSING', `Your order #${orderId.slice(0, 8)} is now being processed.`);

      return { success: true, transactionId };
    } else {
      await this.db
        .update(payments)
        .set({ status: 'FAILED' })
        .where(eq(payments.orderId, orderId));

      // Notify user: payment failed
      await this.notifications.sendPaymentNotification(userId, orderId, 'FAILED', Number(order.totalAmount));

      return { success: false };
    }
  }

  // Cancel order
  async cancel(userId: string, orderId: string) {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      throw new BadRequestException('Cannot cancel shipped or delivered orders');
    }

    // Restore stock
    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      if (item.productId) {
        await this.db
          .update(products)
          .set({
            stock: sql`${products.stock} + ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }
    }

    // Update order status
    const [updated] = await this.db
      .update(orders)
      .set({ status: 'CANCELLED' })
      .where(eq(orders.id, orderId))
      .returning();

    // Notify user: order cancelled
    await this.notifications.sendOrderUpdate(
      userId,
      orderId,
      'CANCELLED',
      `Your order #${orderId.slice(0, 8)} has been cancelled.`,
    );

    return updated;
  }

  // Admin: Get all orders
  async findAllOrders() {
    const allOrders = await this.db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    return Promise.all(
      allOrders.map(async (order) => {
        const items = await this.db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            product: {
              id: products.id,
              name: products.name,
              imageUrl: products.imageUrl,
            },
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        const [payment] = await this.db
          .select()
          .from(payments)
          .where(eq(payments.orderId, order.id))
          .limit(1);

        return {
          ...order,
          items,
          payment,
        };
      })
    );
  }

  // Admin: Update order status
  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const [updated] = await this.db
      .update(orders)
      .set({ status: dto.status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    // Notify user: status changed by admin
    const statusMessages: Record<string, string> = {
      PROCESSING: `Your order #${orderId.slice(0, 8)} is now being processed.`,
      SHIPPED:    `Your order #${orderId.slice(0, 8)} has been shipped and is on the way!`,
      DELIVERED:  `Your order #${orderId.slice(0, 8)} has been delivered. Enjoy!`,
      CANCELLED:  `Your order #${orderId.slice(0, 8)} has been cancelled by the store.`,
    };
    const msg = statusMessages[dto.status] ?? `Your order #${orderId.slice(0, 8)} status changed to ${dto.status}.`;
    await this.notifications.sendOrderUpdate(order.userId ?? '', orderId, dto.status, msg);

    // Also notify admin
    await this.notifications.sendAdminNotification(
      'Order Status Updated',
      `Order #${orderId.slice(0, 8)} changed to ${dto.status}.`,
      { orderId, status: dto.status },
    );

    return updated;
  }
}
