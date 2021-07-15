const ioRedis = require('ioredis');
const log = require('./log');
const config = require('./config');

let redis;

function getRedisClient() {
  if (!redis) {
    log.info('setting up a new redis client');
    redis = ioRedis.createClient(config.REDIS_PORT, config.REDIS_HOST);
  }
  return redis;
}

module.exports = { ioRedis, getRedisClient };
