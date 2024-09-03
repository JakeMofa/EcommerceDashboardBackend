import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';
import { VendoCommerceDBService } from 'src/prisma.service';
import { subject } from '@casl/ability';
import { Brands, users } from 'prisma/commerce/generated/vendoCommerce';

@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    private vendoCommerceDBService: VendoCommerceDBService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: users = request.user;
    const brandId = this.parseBrandId(request);
    const requiredBrandSource = this.reflector.get<string>('brand_source', context.getHandler());
    const requiredAbilities = this.reflector.get<{ action: string }>('check_ability', context.getHandler());

    if (this.isAdminUser(user)) {
      return true;
    }
    if (user.role === 'Amazon_admin') {
      return requiredBrandSource === 'Amazon';
    }
    if (user.role === 'Walmart_admin') {
      return requiredBrandSource === 'Walmart';
    }

    if (!brandId) {
      const ability = await this.caslAbilityFactory.createForUser(user);
      if (requiredAbilities) {
        return ability.can(requiredAbilities.action, 'brand');
      }
      return ability.can('read', 'brand');
    }

    const userBrand = await this.fetchUserBrand(user.id, brandId, requiredBrandSource);
    if (!userBrand) {
      return false;
    }
    const ability = await this.caslAbilityFactory.createForUser(user, userBrand.brand);

    if (requiredAbilities) {
      return ability.can(requiredAbilities.action, this.brandSubject(userBrand.brand));
    }

    return this.checkRolePermissions(userBrand, ability);
  }

  private parseBrandId(request): number {
    return parseInt(request.params.brandId, 10);
  }

  private isAdminUser(user: users): boolean {
    return user && (user.role === 'Admin' || user.role === 'Amazon_admin' || user.role === 'Walmart_admin');
  }

  private async fetchUserBrand(userId: number, brandId: number, requiredBrandSource: string) {
    const userBrands = await this.vendoCommerceDBService.userBrand.findMany({
      where: { userId: userId },
      include: { brand: true },
    });

    return userBrands.find(
      (ub) => ub.brandId === brandId && (!requiredBrandSource || ub.brand.brand_source === requiredBrandSource),
    );
  }

  private brandSubject(brand: Brands) {
    const brandSubject = subject.bind(null, 'brand');
    return brandSubject(brand);
  }

  private checkRolePermissions(userBrand, ability) {
    switch (userBrand.role) {
      case 'Manager':
        return ability.can('update', this.brandSubject(userBrand.brand)) && ability.can('read', 'brand');
      case 'User':
        return ability.can('read', 'brand');
      default:
        return false;
    }
  }
}
