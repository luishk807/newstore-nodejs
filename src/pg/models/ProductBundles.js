const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const ProductItem = require('./ProductItems');

const ProductBundle = sequelize.define('product_bundles', {
  name: {
    type: Sequelize.TEXT
  },
  productItem: {
    type: Sequelize.BIGINT,
    field: 'productItemId',
  },
  retailPrice: {
    type: Sequelize.FLOAT
  },
  stock: {
    type: Sequelize.INTEGER
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

ProductBundle.belongsTo(Statuses, { foreignKey: 'statusId', as: 'productBundleStatus'});

module.exports = ProductBundle;