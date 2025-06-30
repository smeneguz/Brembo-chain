import { Test, TestingModule } from '@nestjs/testing';
import { TxamountController } from './txamount.controller';

describe('TxamountController', () => {
  let controller: TxamountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TxamountController],
    }).compile();

    controller = module.get<TxamountController>(TxamountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
