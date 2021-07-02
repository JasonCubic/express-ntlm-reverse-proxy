const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const webserverWorker = require('./web-server-worker.js');
const config = require('./config');
const log = require('./log');

(() => {
  const dcArr = config.DOMAIN_CONTROLLER_ARR;
  if (!Array.isArray(dcArr) || dcArr.length === 0) {
    log.error('ERROR: unable to locate any Domain Controllers in config settings.');
    process.exit();
  }
  if (cluster.isMaster) {
    for (let j = 0; j < Math.min(numCPUs, config.MAX_CLUSTER_FORKS); j += 1) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      if (signal) {
        log.info(`worker ${worker.process.pid} was killed by signal: ${signal}`);
      } else if (code !== 0) {
        log.info(`worker ${worker.process.pid} exited with error code: ${code}`);
      } else {
        log.info(`worker ${worker.process.pid} died`);
      }
      cluster.fork();
    });
  } else {
    webserverWorker(cluster.worker);
  }
})();
