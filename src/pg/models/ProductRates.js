const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductRate = sequelize.define('product_rates', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  title: {
    type: Sequelize.TEXT
  },
  comment: {
    type: Sequelize.TEXT
  },
  rate: {
    type: Sequelize.NUMBER
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

const getProductRates = () => {
  return ProductRate;
}

module.exports.getModel = getProductRates;