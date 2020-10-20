const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const UserWishlist = sequelize.define('user_wishlists', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

const getUserWishlists = () => {
  return UserWishlist;
}

module.exports.getModel = getUserWishlists;