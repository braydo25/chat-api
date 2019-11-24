const databaseConfig = rootRequire('/config/database');

module.exports = new Sequelize(databaseConfig.database, null, null, {
  dialect: 'mysql',
  dialectOptions: { decimalNumbers: true },
  port: databaseConfig.port,
  replication: {
    read: [
      {
        host: databaseConfig.readHost,
        username: databaseConfig.username,
        password: databaseConfig.password,
      },
    ],
    write: {
      host: databaseConfig.writeHost,
      username: databaseConfig.username,
      password: databaseConfig.password,
    },
  },
  pool: {
    minConnections: databaseConfig.poolMinConnections,
    maxConnections: databaseConfig.poolMaxConnections,
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    underscored: false,
    timestamps: true,
    paranoid: true,
  },
  logging: false,
});
