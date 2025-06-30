import { Test, TestingModule } from '@nestjs/testing';
import { BrakeService } from './brake.service';

describe('BrakeService', () => {
  let service: BrakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrakeService],
    }).compile();

    service = module.get<BrakeService>(BrakeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
