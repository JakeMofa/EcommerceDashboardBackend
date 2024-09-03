import { Test, TestingModule } from '@nestjs/testing';
import { CustomerAcquisitionController } from './customer-acquisition.controller';
import { CustomerAcquisitionService } from './customer-acquisition.service';

describe('CustomerAcquisitionController', () => {
  let controller: CustomerAcquisitionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerAcquisitionController],
      providers: [CustomerAcquisitionService],
    }).compile();

    controller = module.get<CustomerAcquisitionController>(CustomerAcquisitionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
