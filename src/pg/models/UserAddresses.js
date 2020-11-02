const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();
const User = require('./Users');

const Country = require('./Countries');

const UserAddress = sequelize.define('user_addresses', {
  name: {
    type: Sequelize.TEXT
  },
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

UserAddress.belongsTo(Country, { foreignKey: 'countryId', as: 'addressCountry'});

User.hasMany(UserAddress, { foreignKey: 'userId', as: 'userAddresses' })

module.exports = UserAddress;