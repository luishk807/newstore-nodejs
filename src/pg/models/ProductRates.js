const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const ProductRate = sequelize.define('product_rates', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  title: {
    type: Sequelize.TEXT
  },
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
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

ProductRate.belongsTo(Statuses, { foreignKey: 'statusId', as: 'rateStatus'});

module.exports = ProductRate;