const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Product = require('./Products');

const Statuses = require('./Statuses');

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
  },
  priority: {
    type: Sequelize.BOOLEAN
  },
  key: {
    type: Sequelize.TEXT
  },
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "categories",
  onDelete: 'SET NULL',
});

Category.belongsTo(Statuses, { foreignKey: 'statusId', as: 'categoryStatus'});

module.exports = Category;