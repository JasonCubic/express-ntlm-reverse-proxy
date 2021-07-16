const cookieSignature = require('cookie-signature');
const config = require('./config');
const log = require('./log');

// eslint-disable-next-line import/order
const ntlm = require('express-ntlm')({
  debug: (appName, message) => log.debug(appName, message),
  domaincontroller: config.DOMAIN_CONTROLLER_ARR.map((dc) => `ldap://${dc}:3268`),
});

// https://github.com/einfallstoll/express-ntlm/issues/69
function authenticateBySessionBeforeNtlm(req, res, next) {
  const sessionUser = req.session.UserName;
  const userIsSessionAuthenticated = sessionUser && typeof sessionUser.valueOf() === 'string' && sessionUser.length > 0;
  if (userIsSessionAuthenticated === true) {
    log.debug('user authenticated by session: ', sessionUser);
    next();
    return;
  }
  ntlm(req, res, () => {
    const requestingUser = req?.ntlm?.UserName ?? '';
    const requestingUserAuthenticated = req?.ntlm?.Authenticated ?? false;
    const userIsNtlmAuthenticated = requestingUserAuthenticated === true && requestingUser && typeof requestingUser.valueOf() === 'string' && requestingUser.length > 0;
    if (userIsNtlmAuthenticated !== true) {
      log.info('ERROR: auth failed', req.ntlm);
      res.status(200).json({ errors: ['auth failed'] });
      return;
    }
    req.session.UserName = requestingUser;
    req.session.DomainName = req?.ntlm?.DomainName ?? '';
    req.session.Workstation = req?.ntlm?.Workstation ?? '';
    log.debug('user authenticated by NTLM: ', requestingUser);
    next();
  });
}

function overrideSessionCookieWithHeaderSid(req, res, next, redisStore) {
  const overrideSessionId = req.headers?.[config.SESSION_HEADER_TOKEN_FIELD_NAME] ?? '';
  if (overrideSessionId && typeof overrideSessionId.valueOf() === 'string' && overrideSessionId.length > 0) {
    redisStore.get(overrideSessionId, (error, session) => {
      if (error) {
        next();
        return;
      }
      const sessionUser = session?.UserName;
      const userIsSessionAuthenticated = sessionUser && typeof sessionUser.valueOf() === 'string' && sessionUser.length > 0;
      if (userIsSessionAuthenticated === true) {
        log.info(`user authenticated by ${config.SESSION_HEADER_TOKEN_FIELD_NAME} header: `, sessionUser);
        // spoof a cookie for the session middleware to handle normally
        req.cookies['connect.sid'] = `s:${cookieSignature.sign(overrideSessionId, config.SESSION_SECRET)}`;
      }
      next();
    });
  } else {
    next();
  }
}

module.exports = { authenticateBySessionBeforeNtlm, overrideSessionCookieWithHeaderSid };
