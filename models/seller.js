'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seller extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Shop }) {
      // define association here
      this.hasMany(Shop, { foreignKey: 'sellerId' });
    }
  }
  Seller.init(
    {
      isConfirm: DataTypes.BOOLEAN,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Seller',
    }
  );
  return Seller;
};
