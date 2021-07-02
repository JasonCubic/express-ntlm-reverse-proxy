const winston = require('winston');
const stackTrace = require('stack-trace');
const format = require('date-fns/format');
const formatISO = require('date-fns/formatISO');
const config = require('./config');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
  level: config.LOGGING_LEVEL,
});

function convertTimezone(date, locale, tzString) {
  return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString(locale, { timeZone: tzString }));
}

function transformArg(arg) {
  if (arg instanceof Error) {
    return {
      message: arg.message,
      code: arg.code,
      info: arg.info,
      stack: arg.stack,
    };
  }
  return arg;
}

function error(...args) {
  const trace = stackTrace.get(); // https://github.com/felixge/node-stack-trace
  logger.log({
    level: 'error',
    payload: args.map((val) => transformArg(val)),
    time: `${format(convertTimezone(new Date(), config.LOG_LOCALE, config.LOG_TIMEZONE), config.LOG_LOCAL_DATE_FORMAT)} (${config.LOG_TIMEZONE})`,
    timeISO: formatISO(new Date()),
    file: trace[1].getFileName(),
    line: trace[1].getLineNumber(),
  });
}

function warn(...args) {
  const trace = stackTrace.get(); // https://github.com/felixge/node-stack-trace
  logger.log({
    level: 'warn',
    payload: args.map((val) => transformArg(val)),
    time: `${format(convertTimezone(new Date(), config.LOG_LOCALE, config.LOG_TIMEZONE), config.LOG_LOCAL_DATE_FORMAT)} (${config.LOG_TIMEZONE})`,
    timeISO: formatISO(new Date()),
    file: trace[1].getFileName(),
    line: trace[1].getLineNumber(),
  });
}

function info(...args) {
  const trace = stackTrace.get(); // https://github.com/felixge/node-stack-trace
  logger.log({
    level: 'info',
    payload: args.map((val) => transformArg(val)),
    time: `${format(convertTimezone(new Date(), config.LOG_LOCALE, config.LOG_TIMEZONE), config.LOG_LOCAL_DATE_FORMAT)} (${config.LOG_TIMEZONE})`,
    timeISO: formatISO(new Date()),
    file: trace[1].getFileName(),
    line: trace[1].getLineNumber(),
  });
}

function verbose(...args) {
  const trace = stackTrace.get(); // https://github.com/felixge/node-stack-trace
  logger.log({
    level: 'verbose',
    payload: args.map((val) => transformArg(val)),
    time: `${format(convertTimezone(new Date(), config.LOG_LOCALE, config.LOG_TIMEZONE), config.LOG_LOCAL_DATE_FORMAT)} (${config.LOG_TIMEZONE})`,
    timeISO: formatISO(new Date()),
    file: trace[1].getFileName(),
    line: trace[1].getLineNumber(),
  });
}

function debug(...args) {
  const trace = stackTrace.get(); // https://github.com/felixge/node-stack-trace
  logger.log({
    level: 'debug',
    payload: args.map((val) => transformArg(val)),
    time: `${format(convertTimezone(new Date(), config.LOG_LOCALE, config.LOG_TIMEZONE), config.LOG_LOCAL_DATE_FORMAT)} (${config.LOG_TIMEZONE})`,
    timeISO: formatISO(new Date()),
    file: trace[1].getFileName(),
    line: trace[1].getLineNumber(),
  });
}

function silly(...args) {
  const trace = stackTrace.get(); // https://github.com/felixge/node-stack-trace
  logger.log({
    level: 'silly',
    payload: args.map((val) => transformArg(val)),
    time: `${format(convertTimezone(new Date(), config.LOG_LOCALE, config.LOG_TIMEZONE), config.LOG_LOCAL_DATE_FORMAT)} (${config.LOG_TIMEZONE})`,
    timeISO: formatISO(new Date()),
    file: trace[1].getFileName(),
    line: trace[1].getLineNumber(),
  });
}

function noLevel(...args) {
  const trace = stackTrace.get(); // https://github.com/felixge/node-stack-trace
  logger.log({
    payload: args.map((val) => transformArg(val)),
    time: `${format(convertTimezone(new Date(), config.LOG_LOCALE, config.LOG_TIMEZONE), config.LOG_LOCAL_DATE_FORMAT)} (${config.LOG_TIMEZONE})`,
    timeISO: formatISO(new Date()),
    file: trace[1].getFileName(),
    line: trace[1].getLineNumber(),
  });
}

// log levels: https://github.com/winstonjs/winston#logging
module.exports.error = error;
module.exports.warn = warn;
module.exports.info = info;
module.exports.verbose = verbose;
module.exports.debug = debug;
module.exports.silly = silly;
module.exports.log = noLevel;
