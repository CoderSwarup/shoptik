import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('GET / should return service manifest with routes array', () => {
      const result = appController.root();
      expect(result.service).toBe('nestjs-service');
      expect(result.status).toBe('ok');
      expect(Array.isArray(result.routes)).toBe(true);
    });
  });
});
