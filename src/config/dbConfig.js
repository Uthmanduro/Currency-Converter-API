const { Sequelize } = require('sequelize');
const { APP_CONFIG } = require('./appConfig');

const sequelize = new Sequelize(APP_CONFIG.DATABASE_URL, {
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
