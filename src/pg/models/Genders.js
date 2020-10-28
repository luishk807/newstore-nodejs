const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Gender = sequelize.define('gender', {
  name: {
    type: Sequelize.TEXT
  },
});

module.exports = Gender;