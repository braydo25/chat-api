const databaseConfig = rootRequire('/config/database');

/*
 * Hook Methods
 */

const setDataValues = (instance, options) => {
  const { setDataValues } = options || {};

  if (setDataValues) {
    Object.keys(setDataValues).forEach(dataKey => {
      instance.setDataValue(dataKey, setDataValues[dataKey]);
    });
  }
};

/*
 * Export
 */

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
    hooks: {
      afterCreate(instance, options) {
        setDataValues(instance, options);
      },
      afterUpdate(instance, options) {
        setDataValues(instance, options);
      },
      afterDestroy(instance, options) {
        setDataValues(instance, options);
      },
    },
  },
  logging: false,
});
