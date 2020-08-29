const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Product = sequelize.define('product', {
  id: { type: Sequelize.BIGINT, primaryKey: true },
  name: { type: Sequelize.TEXT },
  amount: { type: Sequelize.DECIMAL },
  category: { type: Sequelize.BIGINT },
  brand: { type: Sequelize.BIGINT },
  vendor: { type: Sequelize.BIGINT },
  image: { type: Sequelize.TEXT },
  stock: { type: Sequelize.INTEGER },
  description: { type: Sequelize.TEXT },
  model: { type: Sequelize.TEXT },
  code: { type: Sequelize.TEXT },
});

const getProduct = () => {
  return Product;
}

module.exports.getProductModel = getProduct;