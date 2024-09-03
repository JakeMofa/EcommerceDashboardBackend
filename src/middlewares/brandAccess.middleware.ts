import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  BadRequestException,
  SetMetadata,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { VendoBrandDBService, VendoCommerceDBService } from 'src/prisma.service';
import { BrandsService } from 'src/brands/brands.service';
import { Role } from 'prisma/commerce/generated/vendoCommerce';
import { Reflector } from '@nestjs/core';

@Injectable()
export class BrandAccessMiddleware implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private readonly vendoBrandDBService: VendoBrandDBService,
    private readonly commerceDB: VendoCommerceDBService,
    private readonly brandsService: BrandsService,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const db_write = this.reflector.get<boolean>('db_write', context.getHandler());

    const userId = request.user.id;
    const brandId = request.params.brandId;
    // Check for user access on the brand
    const brand = await this.brandsService.findOne({
      where: {
        id: parseInt(brandId),
      },
      select: {
        db_name: true,
        users: {
          select: {
            user: true,
          },
        },
      },
    });
    // Fetching the brand data
    const manager_brand = await this.commerceDB.brands.findFirst({
      where: {
        id: parseInt(brandId),
        account_manager: {
          id: parseInt(userId),
        },
      },
    });
    if (manager_brand && manager_brand.db_name) {
      if (db_write) {
        await this.vendoBrandDBService.reconnectMaster(manager_brand && manager_brand.db_name);
      } else {
        await this.vendoBrandDBService.reconnect(manager_brand && manager_brand.db_name);
      }
      return next.handle();
    }

    if (!brand) throw new BadRequestException('Brand does not exist.');
    if (
      (brand as any)?.users?.map((u) => u.user.id).includes(parseInt(userId)) ||
      request.user.role === Role.Admin ||
      request.user.role === Role.Walmart_admin ||
      request.user.role === Role.Amazon_admin
    ) {
      if (!brand.db_name) {
        throw new BadRequestException('Brand does not have a database name.');
      } else {
        console.log('Reconnecting to brand database...', brand.db_name);
        if (db_write) {
          await this.vendoBrandDBService.reconnectMaster(brand.db_name);
        } else {
          await this.vendoBrandDBService.reconnect(brand.db_name);
        }
      }
    } else {
      throw new UnauthorizedException('User does not have access to the specified brand.');
    }

    return next.handle();
  }
}

export const db_write = () => SetMetadata('db_write', true);
