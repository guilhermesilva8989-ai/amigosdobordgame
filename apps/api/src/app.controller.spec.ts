import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('deve retornar o estado saudável da API', () => {
      const result = appController.getHealth();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('amigos-do-board-game-api');
      expect(result.version).toBeDefined();
      expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();
    });
  });
});
