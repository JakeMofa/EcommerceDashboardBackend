import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { VendoCommerceDBService } from 'src/prisma.service';
import { BrandsService } from 'src/brands/brands.service';

@Injectable()
export class WalmartConfigMiddleware implements NestInterceptor {
  constructor(private readonly commerceDB: VendoCommerceDBService, private readonly brandsService: BrandsService) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const brandId = request.params.brandId;
    const brand = await this.brandsService.findOne({
      where: {
        id: parseInt(brandId),
      },
      select: {
        advertiser_id: true,
      },
    });
    if (!brand) throw new BadRequestException('Brand does not exist.');
    if (!brand.advertiser_id) throw new BadRequestException('Brand advertiser id is not set.');
    request.advertiser_id = brand.advertiser_id;
    return next.handle();
  }
}
