import { CallHandler, ExecutionContext, createParamDecorator, Injectable, NestInterceptor } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaginationResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  metaData: object;
}
export interface PaginationOptions {
  page: number;
  limit: number;
  order: 'asc' | 'desc';
  orderBy: string;
}
@Injectable()
export class PaginationInterceptor<T> implements NestInterceptor<T, PaginationResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<PaginationResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        data: data.items,
        count: data.count,
        page: data.page,
        order: data.order,
        orderBy: data.orderBy,
        limit: data.limit,
        metaData: data.metaData,
      })),
    );
  }
}

export const Pagination = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  const { page, limit, order, orderBy } = request.query;

  return {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
    order: order || 'desc',
    orderBy: orderBy || 'id',
  };
});

export const ApiPagination = () => {
  return (target: object, key: string, descriptor: PropertyDescriptor) => {
    ApiQuery({ name: 'page', required: false, type: Number })(target, key, descriptor);
    ApiQuery({ name: 'limit', required: false, type: Number })(target, key, descriptor);
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })(target, key, descriptor);
    ApiQuery({ name: 'orderBy', required: false, type: String })(target, key, descriptor);
    ApiQuery({ name: 'limit', required: false, type: String })(target, key, descriptor);
    Pagination(target, key, descriptor);
  };
};
