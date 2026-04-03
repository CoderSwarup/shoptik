import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

export interface OrderLogData {
  orderId: string;
  userId: string;
  eventType: 
    | 'ORDER_CREATED'
    | 'PAYMENT_PENDING'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'STATUS_CHANGED'
    | 'ORDER_CANCELLED'
    | 'ADDRESS_VALIDATED';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class OrderLogsQueue implements OnModuleInit, OnModuleDestroy {
  private connection: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // BullMQ 5.x requires maxRetriesPerRequest: null for ioredis
    this.connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
    });
  }

  async onModuleInit() {
    await this.connection.ping();
    console.log('[OrderLogsQueue] Connected to Redis, ready to publish to stream');
  }

  async onModuleDestroy() {
    await this.connection.quit();
    console.log('[OrderLogsQueue] Closed');
  }

  // Directly publish to Redis Stream (simpler than BullMQ for this use case)
  async addLog(logData: OrderLogData): Promise<void> {
    const streamKey = 'order-logs:events';
    
    // Add to Redis Stream
    await this.connection.xadd(streamKey, '*', 
      'data', JSON.stringify(logData),
      'timestamp', new Date().toISOString()
    );
    
    console.log('[OrderLogsQueue] Published log to stream:', streamKey, logData.eventType);
  }
}
