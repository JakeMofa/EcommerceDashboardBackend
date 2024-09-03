import { PartialType } from '@nestjs/swagger';
import { CreateCustomerAcquisitionDto } from './create-customer-acquisition.dto';

export class UpdateCustomerAcquisitionDto extends PartialType(CreateCustomerAcquisitionDto) {}
