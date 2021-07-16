const cookie = require('cookie');
const cookieSignature = require('cookie-signature');
const config = require('./config');
const log = require('./log');

// eslint-disable-next-line import/order
const ntlm = require('express-ntlm')({
  debug: (appName, message) => log.debug(appName, message),
  domaincontroller: config.DOMAIN_CONTROLLER_ARR.map((dc) => `ldap://${dc}:3268`),
});

function successfulUserAuthenticatedBySession(req) {
  const userIsCreatingAToken = req.originalUrl.replace(/\?.*$/, '') === config.REVERSE_PROXY_CREATE_TOKEN_URL;
  if (userIsCreatingAToken === true) {
    return false;
  }
  const sessionUser = req.session.UserName;
  if (!sessionUser || typeof sessionUser.valueOf() !== 'string') {
    return false;
  }
  if (sessionUser.length === 0) {
    return false;
  }
  return true;
}

// https://github.com/einfallstoll/express-ntlm/issues/69
function authenticateBySessionBeforeNtlm(req, res, next) {
  if (successfulUserAuthenticatedBySession(req)) {
    log.debug('user authenticated by session: ', req.session.UserName);
    next();
    return;
  }
  ntlm(req, res, () => {
    const requestingUser = req?.ntlm?.UserName ?? '';
    const requestingUserAuthenticated = req?.ntlm?.Authenticated ?? false;
    const userIsNtlmAuthenticated = requestingUserAuthenticated === true && requestingUser && typeof requestingUser.valueOf() === 'string' && requestingUser.length > 0;
    if (userIsNtlmAuthenticated !== true) {
      log.info('ERROR: auth failed', req.ntlm);
      req.session.destroy();
      res.sendStatus(401);
      return;
    }
    req.session.UserName = requestingUser;
    req.session.DomainName = req?.ntlm?.DomainName ?? '';
    req.session.Workstation = req?.ntlm?.Workstation ?? '';
    log.debug('user authenticated by NTLM: ', requestingUser);
    next();
  });
}

function setOrReplaceCookieOnIncomingRequest(req, cookieName, cookiePayload) {
  const cookies = cookie.parse(req?.headers?.cookie ?? '');
  const filteredCookies = Object.keys(cookies).filter((row) => row !== cookieName).map((key) => cookie.serialize(key, cookies[key]));
  req.headers.cookie = [cookie.serialize(cookieName, cookiePayload)].concat(filteredCookies).join('; ');
}

function overrideSessionCookieWithHeaderSessionId(req, res, next, redisStore) {
  const rawOverrideSessionId = (req.headers?.[config.SESSION_HEADER_TOKEN_FIELD_NAME] ?? '');
  if (!rawOverrideSessionId || typeof rawOverrideSessionId.valueOf() !== 'string') {
    next();
    return;
  }
  if (rawOverrideSessionId.substr(0, 2) !== 's:') {
    next();
    return;
  }
  const overrideSessionId = cookieSignature.unsign(rawOverrideSessionId.slice(2), config.SESSION_SECRET);
  if (overrideSessionId === false) {
    next();
    return;
  }
  redisStore.get(overrideSessionId, (error, session) => {
    if (error) {
      next();
      return;
    }
    const sessionUser = session?.UserName;
    const userIsSessionAuthenticated = sessionUser && typeof sessionUser.valueOf() === 'string' && sessionUser.length > 0;
    if (userIsSessionAuthenticated !== true) {
      next();
      return;
    }
    log.info(`user authenticated by ${config.SESSION_HEADER_TOKEN_FIELD_NAME} header: `, sessionUser);
    setOrReplaceCookieOnIncomingRequest(req, 'connect.sid', rawOverrideSessionId);
    next();
  });
}

module.exports = { authenticateBySessionBeforeNtlm, overrideSessionCookieWithHeaderSessionId };
