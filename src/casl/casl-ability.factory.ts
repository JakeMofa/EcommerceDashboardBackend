import { Injectable } from '@nestjs/common';
import { VendoCommerceDBService } from 'src/prisma.service';
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Brands, users } from 'prisma/commerce/generated/vendoCommerce';
import { PrismaQuery, createPrismaAbility } from './casl.prisma';
import { Model, Subjects } from '@casl/prisma/runtime';

type AppAbility = PureAbility<
  [
    string,
    (
      | 'all'
      | Subjects<{
          brand: Brands;
          user: users;
        }>
    ),
  ],
  PrismaQuery<Model<Brands, 'Brands'>>
>;

@Injectable()
export class CaslAbilityFactory {
  constructor(private commerce: VendoCommerceDBService) {}

  async createForUser(user: users, brand?: Brands) {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
    // Admins have access to all brand sources
    if (user.role === 'Admin' || user.role === 'Amazon_admin' || user.role === 'Walmart_admin') {
      can('manage', 'brand');
      can('admin', 'brand');
      can('read', 'brand');
      can('update', 'brand');
      can('delete', 'brand');
    } else {
      // Assign permissions based on user role and brand for non-admin users
      if (brand?.id) {
        const { isManager, isAccountManager, isUser } = await this.checkBrandAssociations(user.id, brand.id);
        if (isAccountManager || isManager) {
          can('manage', 'brand', '', { id: { equals: brand.id } });
          can('read', 'brand', '', { id: { equals: brand.id } });
          can('update', 'brand', '', { id: { equals: brand.id } });
        } else if (isUser) {
          can('read', 'brand', '', { id: { equals: brand.id } });
        }
      } else {
        can('read', 'brand');
      }
    }

    return build();
  }

  private async checkBrandAssociations(
    userId: number,
    brandId?: number,
  ): Promise<{ isManager: boolean; isAccountManager: boolean; isUser: boolean }> {
    const brandAssociation = await this.commerce.brands.findFirst({
      where: {
        id: brandId,
        OR: [{ account_manager: { id: userId } }],
      },
    });

    const userAssociation = await this.commerce.userBrand.findFirst({
      where: {
        userId: userId,
        brandId: brandId,
      },
    });

    return {
      isManager: userAssociation?.role === 'Manager',
      isAccountManager: brandAssociation !== null && brandAssociation.account_manager_id === userId,
      isUser: userAssociation?.role === 'User',
    };
  }
}
