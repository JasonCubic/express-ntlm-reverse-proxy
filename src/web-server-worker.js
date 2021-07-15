const express = require('express');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const session = require('express-session');
const connectRedis = require('connect-redis');
const RateLimit = require('express-rate-limit');
const RateLimitRedisStore = require('rate-limit-redis');
const { getRedisClient } = require('./redis');
const { authenticateBySessionBeforeNtlm } = require('./middleware');
const config = require('./config');
const log = require('./log');

function setNtlmHeaderInfo(proxyReq, req) {
  proxyReq.removeHeader('authorization');
  proxyReq.setHeader('x-username', req?.session?.UserName ?? '');
  proxyReq.setHeader('x-domainname', req?.session?.DomainName ?? ''); // DomainName is not guaranteed to be populated
  proxyReq.setHeader('x-workstation', req?.session?.Workstation ?? '');
}

function webserverWorker() {
  const app = express();
  app.use(helmet());

  const redisClient = getRedisClient();

  // https://github.com/nfriedly/express-rate-limit#configuration-options
  const limiter = new RateLimit({
    store: new RateLimitRedisStore({
      client: redisClient,
    }),
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX, // limit each IP to x requests per windowMs
    message: config.RATE_LIMIT_MESSAGE,
    onLimitReached: (req) => log.info('user hit rate limit.  req.socket.remoteAddress: ', req?.socket?.remoteAddress ?? 'undefined'),
  });
  app.use(limiter);

  const SessionRedisStore = connectRedis(session);
  app.use(session({
    // https://github.com/tj/connect-redis#options
    store: new SessionRedisStore({
      client: redisClient,
      ttl: 60 * 30, // 30 minutes
    }),
    saveUninitialized: false,
    secret: config.SESSION_SECRET,
    resave: false,
  }));
  app.use(authenticateBySessionBeforeNtlm);

  app.use(config.REVERSE_PROXY_URI_CONTEXT, createProxyMiddleware({
    target: config.REVERSE_PROXY_TARGET_HOST,
    changeOrigin: true,
    onProxyReq: setNtlmHeaderInfo,
    logProvider: () => log,
  }));

  app
    .listen(config.EXPRESS_PORT, config.EXPRESS_HOST, () => {
      log.info(`Express server worker started, pid ${process.pid}, port ${config.EXPRESS_PORT}, ${app.get('env')} mode`);
    })
    .once('error', (err) => {
      log.error('express error: ', err.message, err);
      process.exit(126);
    });
}

module.exports = webserverWorker;
