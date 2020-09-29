const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductImaage = sequelize.define('product_images', {
  productId: {
    type: Sequelize.BIGINT
  },
  img_url: {
    type: Sequelize.TEXT
  },
  position: {
    type: Sequelize.BIGINT
  }
});

const getProductImages = () => {
  return ProductImaage;
}

module.exports.getModel = getProductImages;