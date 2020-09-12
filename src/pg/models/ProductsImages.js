const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductsImaage = sequelize.define('products_images', {
  product_id: {
    type: Sequelize.BIGINT
  },
  img_url: {
    type: Sequelize.TEXT
  }
});

const getProductsImages = () => {
  return ProductsImaage;
}

module.exports.getModel = getProductsImages;