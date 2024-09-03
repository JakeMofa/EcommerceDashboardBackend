import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string): Promise<any> {
    return await this.cacheManager.get(key);
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  async removeByBrandId(brandId: string | number): Promise<void> {
    const keys = await this.cacheManager.store.keys(`/brands/${brandId}/*`);
    keys?.forEach(async (key) => {
      await this.cacheManager.del(key);
    });
  }
}
