const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Product = require('./Products');

const SweetBox = require('./SweetBoxes');

const Status = require('./Statuses');

const SweetBoxProduct = sequelize.define('sweet_boxes_products', {
  name: {
    type: Sequelize.TEXT
  },
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
  sweetBox: {
    type: Sequelize.TEXT,
    field: 'sweetBoxId'
  },
});

SweetBoxProduct.hasMany(Product, { foreignKey: 'productId', as: 'sweetboxProductProduct'});

SweetBoxProduct.belongsTo(Status, { foreignKey: 'statusId', as: 'sweetboxProductStatus'});

SweetBoxProduct.belongsTo(SweetBox, { foreignKey: 'sweetBoxId', as: 'sweetboxProductSweetBox'});

module.exports = SweetBox;