const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductImage = sequelize.define('product_images', {
  productId: {
    type: Sequelize.BIGINT
  },
  img_url: {
    type: Sequelize.TEXT
  },
  position: {
    type: Sequelize.BIGINT
  },
  img_thumb_url: {
    type: Sequelize.TEXT
  }
});

module.exports = ProductImage;