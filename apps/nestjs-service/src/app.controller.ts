import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  /** GET / — root ping / service manifest */
  @Get()
  @HttpCode(HttpStatus.OK)
  root() {
    return {
      service: 'nestjs-service',
      status: 'ok',
      routes: [
        { method: 'GET', path: '/', description: 'Service manifest (this response)' },
        { method: 'GET', path: '/health', description: 'Service health info' },
        { method: 'GET', path: '/health/db', description: 'Database connectivity check' },
      ],
    };
  }
}
