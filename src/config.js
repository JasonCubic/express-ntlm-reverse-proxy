function config() {
  return {
    EXPRESS_HOST: process.env?.EXPRESS_HOST ?? '0.0.0.0',
    EXPRESS_PORT: parseInt((process.env?.EXPRESS_PORT ?? 8080), 10),
    MAX_CLUSTER_FORKS: parseInt((process.env?.MAX_CLUSTER_FORKS ?? 8080), 12),
    DOMAIN_CONTROLLER_ARR: (process.env?.DOMAIN_CONTROLLER_ARR ?? '').split(',').filter((dc) => dc),
    LOG_LOCALE: process.env?.LOG_LOCALE ?? 'en-US',
    LOG_TIMEZONE: process.env?.LOG_TIMEZONE ?? 'America/Los_Angeles',
    LOG_LOCAL_DATE_FORMAT: process.env?.LOG_LOCAL_DATE_FORMAT ?? 'yyyy-MM-dd hh:mm:ssaaa',
    LOGGING_LEVEL: process.env?.LOGGING_LEVEL ?? 'info', // https://github.com/winstonjs/winston#logging
    REVERSE_PROXY_URI_CONTEXT: process.env?.REVERSE_PROXY_URI_CONTEXT ?? '/api', // https://github.com/chimurai/http-proxy-middleware#context-matching
    // eslint-disable-next-line max-len
    REVERSE_PROXY_TARGET_HOST: process.env?.REVERSE_PROXY_TARGET_HOST ?? 'http://www.example.org/', // https://github.com/chimurai/http-proxy-middleware#createproxymiddlewarecontext-config
    // eslint-disable-next-line max-len
    SESSION_SECRET: process.env?.SESSION_SECRET ?? 'secret_goes_here_this_should_definitely_be_set_in_config_file',
    REDIS_HOST: process.env?.REDIS_HOST ?? 'express-ntlm-reverse-proxy-redis',
    REDIS_PORT: parseInt((process.env?.REDIS_PORT ?? 6379), 10),
    RATE_LIMIT_WINDOW_MS: parseInt((process.env?.RATE_LIMIT_WINDOW_MS ?? 60000), 10),
    RATE_LIMIT_MAX: parseInt((process.env?.RATE_LIMIT_MAX ?? 10), 10),
    RATE_LIMIT_MESSAGE: process.env?.RATE_LIMIT_MESSAGE ?? 'Too many requests, please try again later.',
  };
}

module.exports = (config)();
