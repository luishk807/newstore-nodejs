const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Product = require('./Products');

const Status = require('./Statuses');

const SweetBoxProduct = sequelize.define('sweet_box_products', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
  sweetBox: {
    type: Sequelize.BIGINT,
    field: 'sweetBoxId'
  },
});

SweetBoxProduct.belongsTo(Status, { foreignKey: 'statusId', as: 'sweetboxProductStatus'});

module.exports = SweetBoxProduct;