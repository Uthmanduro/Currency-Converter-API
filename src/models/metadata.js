const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConfig');

class Metadata extends Model {}

Metadata.init(
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    value: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: 'Metadata',
    tableName: 'metadata',
    timestamps: false,
  }
);

module.exports = Metadata;
