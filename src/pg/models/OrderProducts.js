const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const OrderStatus = require('./OrderStatuses');

const ProductItem = require('./ProductItems');

const ProductBundle = require('./ProductBundles');

const OrderProduct = sequelize.define('order_products', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  productItem: {
    type: Sequelize.BIGINT,
    field: 'productItemId'
  },
  quantity: {
    type: Sequelize.NUMBER
  },
  total: {
    type: Sequelize.DECIMAL
  },
  order: {
    type: Sequelize.BIGINT,
    field: 'orderId'
  },
  orderStatus: {
    type: Sequelize.BIGINT,
    field: 'orderStatusId'
  },
  name: {
    type: Sequelize.TEXT,
  },
  unit_total: {
    type: Sequelize.DECIMAL
  },
  description: {
    type: Sequelize.TEXT,
  },
  model: {
    type: Sequelize.TEXT,
  },
  code: {
    type: Sequelize.TEXT,
  },
  sku: {
    type: Sequelize.TEXT,
  },
  category: {
    type: Sequelize.TEXT,
  },
  brand: {
    type: Sequelize.TEXT,
  },
  color: {
    type: Sequelize.TEXT,
  },
  size: {
    type: Sequelize.TEXT,
  },
  productDiscount: {
    type: Sequelize.TEXT
  },
  productBundle: {
    type: Sequelize.BIGINT,
    field: 'productBundleId'
  },
  savePercentageShow: {
    type: Sequelize.TEXT
  },
  originalPrice: {
    type: Sequelize.DECIMAL
  },
  savePercentage: {
    type: Sequelize.DECIMAL
  },
  savePrice: {
    type: Sequelize.DECIMAL
  },
});

OrderProduct.belongsTo(OrderStatus, { foreignKey: 'orderStatusId', as: "orderStatusProduct"})

OrderProduct.belongsTo(ProductItem, { foreignKey: 'productItemId', as: 'orderProductItem' })

OrderProduct.belongsTo(ProductBundle, { foreignKey: 'productBundleId', as: 'orderProductBundle' })

module.exports = OrderProduct;