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
    REVERSE_PROXY_TARGET_HOST: process.env?.REVERSE_PROXY_TARGET_HOST ?? 'http://www.example.org/', // https://github.com/chimurai/http-proxy-middleware#createproxymiddlewarecontext-config
  };
}

module.exports = (config)();
