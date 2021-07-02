const express = require('express');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const ntlm = require('express-ntlm');
const config = require('./config');
const log = require('./log');

function verifyNtlmMiddleware(req, res, next) {
  const requestingUser = req?.ntlm?.UserName ?? '';
  const requestingUserAuthenticated = req?.ntlm?.Authenticated ?? false;
  if (requestingUserAuthenticated === true && requestingUser.length === 0) {
    log.info('ERROR: auth failed', req.ntlm);
    res.status(200).json({ errors: ['auth failed'] });
    return;
  }
  next();
}

function setNtlmHeaderInfo(proxyReq, req) {
  proxyReq.removeHeader('authorization');
  proxyReq.removeHeader('x-powered-by');
  proxyReq.setHeader('x-username', req?.ntlm?.UserName ?? '');
  proxyReq.setHeader('x-domainname', req?.ntlm?.DomainName ?? ''); // DomainName is not guaranteed to be populated
  proxyReq.setHeader('x-workstation', req?.ntlm?.Workstation ?? '');
}

function webserverWorker() {
  const app = express();
  app.use(helmet());

  app.use(ntlm({
    debug: (appName, message) => log.debug(appName, message),
    domaincontroller: config.DOMAIN_CONTROLLER_ARR.map((dc) => `ldap://${dc}:389`),
  }));

  app.use(verifyNtlmMiddleware);

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
