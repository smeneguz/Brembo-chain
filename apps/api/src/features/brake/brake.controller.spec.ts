import { Test, TestingModule } from '@nestjs/testing';
import { BrakeController } from './brake.controller';

describe('BrakeController', () => {
  let controller: BrakeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrakeController],
    }).compile();

    controller = module.get<BrakeController>(BrakeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
