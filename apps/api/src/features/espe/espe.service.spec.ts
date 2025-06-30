import { Test, TestingModule } from '@nestjs/testing';
import { EspeService } from './espe.service';

describe('EspeService', () => {
  let service: EspeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EspeService],
    }).compile();

    service = module.get<EspeService>(EspeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
