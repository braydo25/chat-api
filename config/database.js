const {
  MYSQL_DATABASE,
  MYSQL_PORT,
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_WRITE_HOST,
  MYSQL_READ_HOST,
} = process.env;

module.exports = {
  readHost: MYSQL_READ_HOST,
  writeHost: MYSQL_WRITE_HOST,
  database: MYSQL_DATABASE,
  port: MYSQL_PORT,
  username: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  poolMinConnections: 1,
  poolMaxConnections: 8,
};
