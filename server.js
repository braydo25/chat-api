/*
 * set environment variables from .env, machine
 * defined environment variables still take priority
 */

require('dotenv').config();

const cluster = require('cluster');
const os = require('os');

const clusterEnvironments = [ 'staging', 'production' ];

if (cluster.isMaster && clusterEnvironments.includes(process.env.NODE_ENV)) {
  os.cpus().forEach(() => {
    cluster.fork();
  });

  cluster.on('exit', () => {
    cluster.fork();
  });
} else {
  require('./worker');
}
