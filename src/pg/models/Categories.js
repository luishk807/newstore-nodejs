const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Product = require('./Products');

const Category = sequelize.define('category', {
  name: {
    type: Sequelize.TEXT
  },
  icon: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "categories",
  onDelete: 'SET NULL',
});

module.exports = Category;