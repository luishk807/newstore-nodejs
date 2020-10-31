const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Status = sequelize.define('statuses', {
  name: {
    type: Sequelize.TEXT
  },
});

module.exports = Status;