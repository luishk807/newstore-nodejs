const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const ProductItemImages = require('./ProductItemImages');

const ProductColor = require('./ProductColors');

const ProductSize = require('./ProductSizes');

const ProductItem = sequelize.define('product_items', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true
  },
  product: {
    type: Sequelize.BIGINT,
    field: 'productId',
  },
  productColor: {
    type: Sequelize.BIGINT,
    field: 'productColorId',
  },
  productSize: {
    type: Sequelize.BIGINT,
    field: 'productSizeId',
  },
  stock: { type: Sequelize.INTEGER },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
  model: { type: Sequelize.TEXT },
  sku: { type: Sequelize.TEXT },
  code: { type: Sequelize.TEXT },
  vendor: { 
    type: Sequelize.BIGINT,
    field: 'vendorId'
  },
  billingCost: { type: Sequelize.DECIMAL },
  unitCost: { type: Sequelize.DECIMAL },
  profitPercentage: { type: Sequelize.DECIMAL },
  flete: { type: Sequelize.DECIMAL },
  fleteTotal: { type: Sequelize.DECIMAL },
  finalUnitPrice: { type: Sequelize.DECIMAL },
  unitPrice: { type: Sequelize.DECIMAL },
  exp_date: { type: Sequelize.DATE },
  retailPrice: { type: Sequelize.DECIMAL },
  source: { type: Sequelize.STRING}
});

ProductItem.belongsTo(Statuses, { foreignKey: 'statusId', as: 'productItemsStatus'});

ProductItem.belongsTo(ProductColor, { foreignKey: 'productColorId', as: 'productItemColor'});

ProductItem.belongsTo(ProductSize, { foreignKey: 'productSizeId', as: 'productItemSize'});

ProductItem.hasMany(ProductItemImages, { as: "productImages"});

//ProductItem.belongsTo(Product, { foreignKey: 'productId', as: 'productItemsProduct'})
module.exports = ProductItem;