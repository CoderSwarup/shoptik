import { Global, Module } from '@nestjs/common';
import { db } from './index.js';

export const DB_CLIENT = 'DB_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: DB_CLIENT,
      useValue: db,
    },
  ],
  exports: [DB_CLIENT],
})
export class DbModule {}
