const winston = require('winston');
const stackTrace = require('stack-trace');
const format = require('date-fns/format');
const formatISO = require('date-fns/formatISO');
const config = require('./config');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
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

function handleLogging(payload, trace, level = '') {
  const logObj = {};
  if (level && typeof level.valueOf() === 'string' && level.length > 0) {
    logObj.level = level;
  }
  logObj.payload = payload;
  logObj.time = `${format(convertTimezone(new Date(), config.LOG_LOCALE, config.LOG_TIMEZONE), config.LOG_LOCAL_DATE_FORMAT)} (${config.LOG_TIMEZONE})`;
  logObj.timeISO = formatISO(new Date());
  logObj.file = trace[1].getFileName();
  logObj.line = trace[1].getLineNumber();
  logger.log(logObj);
}

// log levels: https://github.com/winstonjs/winston#logging
module.exports.error = (...args) => handleLogging(args.map((val) => transformArg(val)), stackTrace.get(), 'error');
module.exports.warn = (...args) => handleLogging(args.map((val) => transformArg(val)), stackTrace.get(), 'warn');
module.exports.info = (...args) => handleLogging(args.map((val) => transformArg(val)), stackTrace.get(), 'info');
module.exports.verbose = (...args) => handleLogging(args.map((val) => transformArg(val)), stackTrace.get(), 'verbose');
module.exports.debug = (...args) => handleLogging(args.map((val) => transformArg(val)), stackTrace.get(), 'debug');
module.exports.silly = (...args) => handleLogging(args.map((val) => transformArg(val)), stackTrace.get(), 'silly');
module.exports.log = (...args) => handleLogging(args.map((val) => transformArg(val)), stackTrace.get());
