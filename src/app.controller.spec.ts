import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('returns the service message', () => {
    expect(controller.getHello()).toEqual({
      message: 'NestJS Multiservice starter is running',
    });
  });

  it('reports healthy', () => {
    expect(controller.health()).toEqual({ status: 'ok' });
  });
});
