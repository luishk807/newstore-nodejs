const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Province = sequelize.define('provinces', {
  name: {
    type: Sequelize.TEXT
  },
});

module.exports = Province;