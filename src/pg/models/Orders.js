const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const OrderStatus = require('./OrderStatuses');

const User = require('./Users');

const OrderProduct = require('./OrderProducts');

const OrderCancelReason = require('./OrderCancelReasons');

const DeliveryService = require('./DeliveryServices');

const DeliveryServiceGroupCost = require('./DeliveryServiceGroupCosts');

const PaymentOption = require('./PaymentOptions');

const DeliveryOption = require('./DeliveryOptions');

const OrderActivity = require('./OrderActivities');

const OrderPayment = require('./OrderPayments');
 
const Order = sequelize.define('orders', {
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
  subtotal: {
    type: Sequelize.DECIMAL
  },
  order_number: {
    type: Sequelize.TEXT
  },
  grandtotal: {
    type: Sequelize.DECIMAL
  },
  tax: {
    type: Sequelize.DECIMAL
  },
  orderStatus: {
    type: Sequelize.BIGINT,
    field: 'orderStatusId'
  },
  orderCancelReason: {
    type: Sequelize.BIGINT,
    field: 'orderCancelReasonId'
  },
  shipping_name: {
    type: Sequelize.TEXT
  },
  shipping_address: {
    type: Sequelize.TEXT
  },
  shipping_city: {
    type: Sequelize.TEXT
  },
  shipping_country: {
    type: Sequelize.TEXT
  },
  shipping_province: {
    type: Sequelize.TEXT
  },
  shipping_township: {
    type: Sequelize.TEXT
  },
  shipping_corregimiento: {
    type: Sequelize.TEXT
  },
  shipping_zone: {
    type: Sequelize.TEXT
  },
  shipping_note: {
    type: Sequelize.TEXT
  },
  shipping_zip: {
    type: Sequelize.TEXT
  },
  shipping_email: {
    type: Sequelize.TEXT
  },
  shipping_phone: {
    type: Sequelize.TEXT
  },
  shipping_district: {
    type: Sequelize.TEXT
  },
  delivery: {
    type: Sequelize.DECIMAL
  },
  deliveryOptionId: {
    type: Sequelize.BIGINT
  },
  deliveryOption: {
    type: Sequelize.TEXT
  },
  deliveryService: {
    type: Sequelize.TEXT
  },
  deliveryServiceId: {
    type: Sequelize.BIGINT
  },
  deliveryServiceGroupCostId: {
    type: Sequelize.BIGINT
  },
  paymentOption: {
    type: Sequelize.TEXT
  },
  paymentOptionId: {
    type: Sequelize.BIGINT
  },
  totalSaved: {
    type: Sequelize.DECIMAL
  },
});

Order.belongsTo(OrderCancelReason, { foreignKey: 'orderCancelReasonId', as: "orderCancelReasons"})

Order.belongsTo(OrderStatus, { foreignKey: 'orderStatusId', as: "orderStatuses"})

Order.belongsTo(DeliveryOption, { foreignKey: 'deliveryOptionId', as: "deliveryOrder"})

Order.belongsTo(User, { foreignKey: 'userId', as: 'orderUser' })

Order.belongsTo(DeliveryService, { foreignKey: 'deliveryServiceId', as: 'orderDeliveryService' })

Order.belongsTo(DeliveryServiceGroupCost, { foreignKey: 'deliveryServiceGroupCostId', as: 'orderDeliveryServiceGroupCost' })

Order.belongsTo(PaymentOption, { foreignKey: 'paymentOptionId', as: 'orderPayment' })

Order.hasMany(OrderProduct, { as: 'orderOrderProduct'})

Order.hasMany(OrderActivity, { as: 'orderOrderActivity'})

Order.hasMany(OrderPayment, { as: 'orderOrderPayment'})

module.exports = Order;