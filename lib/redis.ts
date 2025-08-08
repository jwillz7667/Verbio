import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL not configured');
  }
  redis = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });
  return redis;
}


