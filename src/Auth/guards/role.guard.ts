import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { Role, users } from 'prisma/commerce/generated/vendoCommerce';
import { VendoCommerceDBService } from '../../prisma.service';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private commerceDB: VendoCommerceDBService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
      if (!requiredRoles) {
        return true;
      }
      const request = context.switchToHttp().getRequest();
      const user: users = request.user;
      if (!user) {
        return false;
      }

      const userData = await this.commerceDB.users.findUnique({
        where: { id: user.id },
        include: { manager_brands: true },
      });
      if (!userData) {
        return false;
      }
      if (userData.manager_brands.length > 0) {
        return true;
      }

      // Now compare the user role with the required roles
      return requiredRoles.some((role) => userData.role === role);
    } catch (error) {
      console.error('Error in RoleGuard.canActivate:', error);
      return false;
    }
  }
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
