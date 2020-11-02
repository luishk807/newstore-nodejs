const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Country = sequelize.define('country', {
  nicename: {
    type: Sequelize.TEXT
  },
  iso: {
    type: Sequelize.TEXT
  },
  iso3: {
    type: Sequelize.TEXT
  },
});

module.exports = Country;