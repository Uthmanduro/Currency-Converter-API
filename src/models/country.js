const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConfig');

class Country extends Model {}

Country.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capital: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    population: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    currency_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    exchange_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    estimated_gdp: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    flag_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_refreshed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Country',
    tableName: 'countries',
    timestamps: false,
    indexes: [{ fields: ['name'] }],
  }
);

module.exports = Country;
