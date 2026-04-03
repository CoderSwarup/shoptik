import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { DbModule } from './db/db.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';
import { AddressesModule } from './addresses/addresses.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { DeliveryZonesModule } from './delivery-zones/delivery-zones.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';

@Module({
  imports: [DbModule, HealthModule, AuthModule, ProductsModule, AddressesModule, OrdersModule, DeliveryZonesModule, NotificationsModule],
  controllers: [AppController],
})
export class AppModule {}
