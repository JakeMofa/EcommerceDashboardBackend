import { CACHE_TTL_METADATA } from './redis-cache.decorator';
import { Injectable, ExecutionContext, CallHandler, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisCacheService } from './redis-cache.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: RedisCacheService, private reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const ttl = await this.reflector.get(CACHE_TTL_METADATA, context.getHandler());
    if (!ttl) {
      return next.handle();
    }
    // Generate cache key using baseKey, parameters and query
    const key = request.url;

    const cachedData = await this.cacheService.get(key);

    if (cachedData) {
      // Send cached data if it exists
      return of(cachedData);
    }

    // If there is no cached data, call the handler and cache its result
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(key, data, ttl);
      }),
    );
  }
}
