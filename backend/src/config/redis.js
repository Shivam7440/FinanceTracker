import Redis from 'ioredis';
import { config } from './env.js';

let redisClient = null;
let isRedisConnected = false;

// In-memory fallback cache store
const memoryCache = new Map();

// Metrics tracking for verification & reporting
export const cacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  invalidations: 0,
  lastHitTimeMs: null,
  lastMissTimeMs: null,
};

export async function initRedis() {
  if (config.redisUrl) {
    try {
      console.log('Connecting to Redis instance...');
      redisClient = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy: (times) => {
          if (times > 2) {
            console.warn('Redis reconnection failed. Switching to in-memory cache fallback.');
            return null; // Stop retrying
          }
          return 500;
        }
      });

      redisClient.on('connect', () => {
        isRedisConnected = true;
        console.log('Connected to Redis server successfully.');
      });

      redisClient.on('error', (err) => {
        console.warn('Redis connection notice:', err.message);
        isRedisConnected = false;
      });
    } catch (err) {
      console.warn('Redis initialization error:', err.message);
      isRedisConnected = false;
    }
  } else {
    console.log('No REDIS_URL provided. Operating with in-memory resilient cache provider.');
    isRedisConnected = false;
  }
}

/**
 * Retrieve cached value by key
 */
export async function getCache(key) {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        cacheMetrics.hits++;
        return JSON.parse(data);
      }
      cacheMetrics.misses++;
      return null;
    } catch (err) {
      console.warn('Redis GET failed, checking memory fallback:', err.message);
    }
  }

  // Memory fallback
  const entry = memoryCache.get(key);
  if (!entry) {
    cacheMetrics.misses++;
    return null;
  }

  if (Date.now() > entry.expiry) {
    memoryCache.delete(key);
    cacheMetrics.misses++;
    return null;
  }

  cacheMetrics.hits++;
  return entry.value;
}

/**
 * Set cache value with TTL in seconds
 */
export async function setCache(key, value, ttlSeconds) {
  cacheMetrics.sets++;
  const serialized = JSON.stringify(value);

  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
    } catch (err) {
      console.warn('Redis SET failed, storing in memory fallback:', err.message);
    }
  }

  // Always keep in memory store as fallback
  memoryCache.set(key, {
    value,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
}

/**
 * Delete a specific key
 */
export async function deleteCache(key) {
  cacheMetrics.invalidations++;
  memoryCache.delete(key);

  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.warn('Redis DEL failed:', err.message);
    }
  }
}

/**
 * Invalidate all keys matching a prefix or wildcard pattern
 * E.g., analytics:{userId}:*
 */
export async function invalidatePattern(pattern) {
  cacheMetrics.invalidations++;

  // Invalidate memory cache
  const regexStr = '^' + pattern.replace(/\*/g, '.*') + '$';
  const regex = new RegExp(regexStr);
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  }

  // Invalidate in Redis if connected
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys && keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {
      console.warn('Redis pattern invalidation error:', err.message);
    }
  }
}

/**
 * Specific cache helper for user analytics invalidation
 */
export async function invalidateUserAnalytics(userId) {
  await invalidatePattern(`analytics:${userId}:*`);
}

/**
 * Specific cache helper for categories invalidation
 */
export async function invalidateCategories() {
  await deleteCache('categories:all');
}

export function getCacheStatus() {
  return {
    engine: isRedisConnected ? 'redis' : 'in-memory-fallback',
    isConnected: isRedisConnected,
    metrics: { ...cacheMetrics },
    activeMemoryKeys: memoryCache.size
  };
}
