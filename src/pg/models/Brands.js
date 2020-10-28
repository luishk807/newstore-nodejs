const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const Product = require('./Products');

const Brand = sequelize.define('brand', {
  name: {
    type: Sequelize.TEXT
  },
  img: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

Brand.hasMany(Product);

Product.belongsTo(Brand, { foreignKey: 'brand', as: 'productBrand'});

Brand.belongsTo(Statuses, {as: 'brandStatus'});

module.exports = Brand;