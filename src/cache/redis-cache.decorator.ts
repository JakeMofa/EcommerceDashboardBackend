import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache-key';
export const CACHE_TTL_METADATA = 'cache-ttl';

export const Cache = (key: string, ttl = 60) => {
  return SetMetadata(CACHE_KEY_METADATA, key), SetMetadata(CACHE_TTL_METADATA, ttl);
};
