import { Test, TestingModule } from '@nestjs/testing';
import { StatorService } from './stator.service';

describe('StatorService', () => {
  let service: StatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatorService],
    }).compile();

    service = module.get<StatorService>(StatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
