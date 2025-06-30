import { Test, TestingModule } from '@nestjs/testing';
import { EspeController } from './espe.controller';

describe('EspeController', () => {
  let controller: EspeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EspeController],
    }).compile();

    controller = module.get<EspeController>(EspeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
