const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Product = sequelize.define('product', {
  name: { type: Sequelize.TEXT },
  amount: { type: Sequelize.DECIMAL },
  category: { type: Sequelize.BIGINT, field: 'categoryId' },
  brand: { type: Sequelize.BIGINT, field: 'brandId' },
  vendor: { type: Sequelize.BIGINT, field: 'vendorId' },
  status: { type: Sequelize.BIGINT, field: 'statusId' },
  image: { type: Sequelize.TEXT },
  stock: { type: Sequelize.INTEGER },
  description: { type: Sequelize.TEXT },
  model: { type: Sequelize.TEXT },
  code: { type: Sequelize.TEXT },
});

const getProduct = () => {
  return Product;
}

module.exports.getModel = getProduct;