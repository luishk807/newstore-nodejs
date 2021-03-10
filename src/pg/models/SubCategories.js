const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Category = require('./Categories');

const Product = require('./Products');

const SubCategory = sequelize.define('sub_categories', {
  name: {
    type: Sequelize.TEXT
  },
  icon: {
    type: Sequelize.TEXT
  },
  category: {
    type: Sequelize.BIGINT,
    field: 'categoryId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

SubCategory.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "subCategoriesCategory"
});

Product.belongsTo(SubCategory, {
  foreignKey: "subCategoryId",
  as: "subCategoryProduct"
});

module.exports = SubCategory;