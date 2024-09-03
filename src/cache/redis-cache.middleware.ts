import { CACHE_KEY_METADATA } from './redis-cache.decorator';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

@Injectable()
export class CacheMiddleware implements NestMiddleware {
  constructor(private readonly cacheService: RedisCacheService) {}

  async use(req, res, next) {
    const baseKey = Reflect.getMetadata(CACHE_KEY_METADATA, req.baseUrl);

    // Generate cache key using baseKey, parameters and query
    const key = `${baseKey}_${JSON.stringify(req.params)}_${JSON.stringify(req.query)}`;

    const cachedData = await this.cacheService.get(key);

    if (cachedData) {
      return res.send(cachedData);
    }

    next();
  }
}
