const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Country = sequelize.define('country', {
  nicename: {
    type: Sequelize.TEXT
  },
});

module.exports = Country;