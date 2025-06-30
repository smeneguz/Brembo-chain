import { Test, TestingModule } from '@nestjs/testing';
import { RotorService } from './rotor.service';

describe('RotorService', () => {
  let service: RotorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RotorService],
    }).compile();

    service = module.get<RotorService>(RotorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
