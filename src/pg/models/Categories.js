const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

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

const getCategory = () => {
  return Category;
}

module.exports.getModel = getCategory;