import { Test, TestingModule } from '@nestjs/testing';
import { SalesBySkuService } from './sales.sku.service';

describe('SalesService', () => {
  let service: SalesBySkuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesBySkuService],
    }).compile();

    service = module.get<SalesBySkuService>(SalesBySkuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
