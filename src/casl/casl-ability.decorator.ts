import { SetMetadata } from '@nestjs/common';

export const BrandSource = (brandSource: 'Amazon' | 'Walmart') => SetMetadata('brand_source', brandSource);

export const CheckAbility = (action: 'admin' | 'read' | 'update' | 'manage' | 'delete') =>
  SetMetadata('check_ability', { action });
