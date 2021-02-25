const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const ProductColor = sequelize.define('product_colors', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId',
  },
  color: {
    type: Sequelize.TEXT
  },
  name: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

ProductColor.belongsTo(Statuses, { foreignKey: 'statusId', as: 'colorStatus'});

module.exports = ProductColor;