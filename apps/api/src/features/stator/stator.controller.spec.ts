import { Test, TestingModule } from '@nestjs/testing';
import { StatorController } from './stator.controller';

describe('StatorController', () => {
  let controller: StatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatorController],
    }).compile();

    controller = module.get<StatorController>(StatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
