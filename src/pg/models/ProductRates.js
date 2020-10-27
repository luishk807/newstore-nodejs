const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const UserModel = require('./Users');
const User = UserModel.getModel();


const ProductRate = sequelize.define('product_rates', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  title: {
    type: Sequelize.TEXT
  },
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
  comment: {
    type: Sequelize.TEXT
  },
  rate: {
    type: Sequelize.NUMBER
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

ProductRate.belongsTo(User, {as: 'rateUser'});

User.hasMany(ProductRate)

const getProductRates = () => {
  return ProductRate;
}

module.exports.getModel = getProductRates;