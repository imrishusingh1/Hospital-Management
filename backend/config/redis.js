const redis = require('redis');
require('dotenv').config();

let redisClient;
let isRedisConnected = false;

if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('Redis Client Connected');
  });

  // Connect to Redis
  redisClient.connect().catch(console.error);
} else {
  console.log('REDIS_URL not provided. Running without Redis caching.');
  // Mock Redis client for fallback
  redisClient = {
    get: async () => null,
    setEx: async () => null,
    del: async () => null,
  };
}

module.exports = { redisClient, isRedisConnected };
