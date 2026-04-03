import { Controller, Get, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { OrderLogsService } from './order-logs.service.js';

@Controller('sse')
export class OrderLogsGateway {
  constructor(private readonly orderLogsService: OrderLogsService) {}

  @Get('order-logs')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('X-Accel-Buffering', 'no')
  async streamOrderLogs(@Res() res: Response) {
    (res as any).flushHeaders();

    // Send initial connection message
    this.sendEvent(res, 'connected', { type: 'connected', message: 'SSE stream connected' });

    try {
      // Fetch recent logs once and send them
      const recentLogs = await this.orderLogsService.getRecentLogs(50);
      
      if (recentLogs.logs && recentLogs.logs.length > 0) {
        for (const log of recentLogs.logs) {
          this.sendLogEvent(res, { type: 'log', data: log });
        }
      }

      // Keep connection open - client will reconnect if needed
      const interval = setInterval(async () => {
        try {
          const newLogs = await this.orderLogsService.getRecentLogs(10);
          if (newLogs.logs && newLogs.logs.length > 0) {
            const uniqueLogs = newLogs.logs.slice(0, 5);
            for (const log of uniqueLogs) {
              this.sendLogEvent(res, { type: 'log', data: log });
            }
          }
        } catch (err) {
          console.error('[SSE] Error polling for logs:', err);
        }
      }, 2000);

      res.on('close', () => {
        clearInterval(interval);
        console.log('[SSE] Client disconnected');
      });

    } catch (error) {
      console.error('[SSE] Error:', error);
      this.sendEvent(res, 'error', { type: 'error', message: 'Failed to fetch logs' });
    }
  }

  private sendEvent(res: Response, eventName: string, data: any) {
    const chunk = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`
    res.write(chunk)
  }

  private sendLogEvent(res: Response, data: any) {
    const chunk = `event: log\ndata: ${JSON.stringify(data)}\n\n`
    res.write(chunk)
  }
}
