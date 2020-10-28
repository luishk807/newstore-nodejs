const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Product = require('./Products');

const UserWishlist = sequelize.define('user_wishlists', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

UserWishlist.belongsTo(Product, {foreignKey: 'productId', as: 'wishlistProduct'});

module.exports = UserWishlist;