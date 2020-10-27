const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductModel = require('./Products');
const Product = ProductModel.getModel();

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

UserWishlist.belongsTo(Product, {as: 'wishlistProduct'});

const getUserWishlists = () => {
  return UserWishlist;
}

module.exports.getModel = getUserWishlists;