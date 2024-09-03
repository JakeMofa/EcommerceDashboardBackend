enum productDataStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Incomplete = 'Incomplete',
}

export class CreateProductDataDTO {
  asin: string;
  sku: string;
  productTitle: string;
  status: productDataStatus;
  case_pack_size: number;
}
