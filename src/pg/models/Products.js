const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Product = sequelize.define('product', {
  name: { type: Sequelize.TEXT },
  amount: { type: Sequelize.DECIMAL },
  categoryId: { type: Sequelize.BIGINT },
  brandId: { type: Sequelize.BIGINT },
  vendorId: { type: Sequelize.BIGINT },
  statusId: { type: Sequelize.BIGINT },
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