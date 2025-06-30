import { Test, TestingModule } from '@nestjs/testing';
import { TxamountService } from './txamount.service';

describe('TxamountService', () => {
  let service: TxamountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TxamountService],
    }).compile();

    service = module.get<TxamountService>(TxamountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
