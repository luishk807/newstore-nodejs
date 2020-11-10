const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();
const Order = require('./Orders');

const Country = require('./Countries');
const AddressType = require('./AddressTypes');

const OrderAddress = sequelize.define('order_addresses', {
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
  order: {
    type: Sequelize.BIGINT,
    field: 'orderId'
  },
  addressType: {
    type: Sequelize.BIGINT,
    field: 'addressTypeId'
  },
});

OrderAddress.belongsTo(Order, { foreignKey: 'orderId', as: 'orderAddressesOrders'})

OrderAddress.belongsTo(Country, { foreignKey: 'countryId', as: 'orderAddressCountry'});

OrderAddress.hasMany(AddressType, { foreignKey: 'addressTypeId', as: 'orderAdressAddressType' })

module.exports = OrderAddress;