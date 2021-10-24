const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const ProductSize = sequelize.define('product_sizes', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId',
  },
  name: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
},
{
  schema: 'public',
}
);

ProductSize.belongsTo(Statuses, { foreignKey: 'statusId', as: 'sizeStatus'});

module.exports = ProductSize;
