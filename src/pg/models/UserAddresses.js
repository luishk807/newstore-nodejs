const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();
const User = require('./Users');

const UserAddress = sequelize.define('user_addresses', {
  address: {
    type: Sequelize.TEXT
  },
  province: {
    type: Sequelize.TEXT
  },
  city: {
    type: Sequelize.TEXT
  },
  township: {
    type: Sequelize.TEXT
  },
  country: {
    type: Sequelize.BIGINT,
    field: 'countryId'
  },
  state: {
    type: Sequelize.BIGINT
  },
  zip: {
    type: Sequelize.TIME
  },
  phone: {
    type: Sequelize.TIME
  },
  mobile: {
    type: Sequelize.TIME
  },
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
});

UserAddress.belongsTo(User, { foreignKey: 'userId', as: 'addressesUsers'})

User.hasMany(UserAddress, { foreignKey: 'userId', as: 'userAddresses' })

module.exports = UserAddress;