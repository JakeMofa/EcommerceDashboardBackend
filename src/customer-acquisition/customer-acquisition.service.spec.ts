import { Test, TestingModule } from '@nestjs/testing';
import { CustomerAcquisitionService } from './customer-acquisition.service';

describe('CustomerAcquisitionService', () => {
  let service: CustomerAcquisitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerAcquisitionService],
    }).compile();

    service = module.get<CustomerAcquisitionService>(CustomerAcquisitionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
