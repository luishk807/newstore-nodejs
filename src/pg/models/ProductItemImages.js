const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductItemImage = sequelize.define('product_item_images', {
  productItemId: {
    type: Sequelize.BIGINT
  },
  img_url: {
    type: Sequelize.TEXT
  },
  position: {
    type: Sequelize.BIGINT
  }
});

module.exports = ProductItemImage;