const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductDiscount = sequelize.define('product_discounts', {
  productId: {
    type: Sequelize.BIGINT
  },
  price: {
    type: Sequelize.FLOAT
  },
  name: {
    type: Sequelize.TEXT
  },
  minQuantity: {
    type: Sequelize.INTEGER
  },
  startDate: {
    type: Sequelize.DATE
  },
  endDate: {
    type: Sequelize.DATE
  },
  percentage: {
    type: Sequelize.FLOAT
  },
  useDate: {
    type: Sequelize.BOOLEAN
  }
});

module.exports = ProductDiscount;