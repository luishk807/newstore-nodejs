const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const StatusModel = require('./Statuses');
const Statuses = StatusModel.getModel();

const ProductModel = require('./Products');
const Product = ProductModel.getModel();

const Brand = sequelize.define('brand', {
  name: {
    type: Sequelize.TEXT
  },
  img: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

Brand.hasMany(Product);

Product.belongsTo(Brand, { foreignKey: 'brand', as: 'productBrand'});

Brand.belongsTo(Statuses, {as: 'brandStatus'});

const getBrand = () => {
  return Brand;
}

module.exports.getModel = getBrand;