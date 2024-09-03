import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VendoCommerceDBService } from 'src/prisma.service';
import { Permission } from '../permissions.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: VendoCommerceDBService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<Permission[]>('permissions', context.getHandler());
    if (!requiredPermissions) {
      return true; // no permissions required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: { permissions: true },
    });
    if (!user) {
      return false; // user not found, deny access
    }

    return requiredPermissions.every((permission) => user.permissions.map((p) => p.name).includes(permission));
  }
}

export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);
