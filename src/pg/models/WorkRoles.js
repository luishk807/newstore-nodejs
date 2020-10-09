const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const WorkRole = sequelize.define('work_roles', {
  name: {
    type: Sequelize.TEXT
  },
});

const getWorkRole = () => {
  return WorkRole;
}

module.exports.getModel = getWorkRole;