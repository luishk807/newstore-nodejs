const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Product = require('./Products');

const SweetBox = require('./SweetBoxes');

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

// SweetBoxProduct.belongsTo(SweetBox, { foreignKey: 'sweetBoxId', as: 'sweetboxProductSweetBox'});

module.exports = SweetBoxProduct;