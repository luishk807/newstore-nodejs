const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Category = sequelize.define('category', {
  name: {
    type: Sequelize.TEXT
  }
});

const getCategory = () => {
  return Category;
}

module.exports.getModel = getCategory;