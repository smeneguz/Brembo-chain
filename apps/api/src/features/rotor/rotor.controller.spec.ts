import { Test, TestingModule } from '@nestjs/testing';
import { RotorController } from './rotor.controller';

describe('RotorController', () => {
  let controller: RotorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RotorController],
    }).compile();

    controller = module.get<RotorController>(RotorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
