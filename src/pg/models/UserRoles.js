const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const UserRole = sequelize.define('user_roles', {
  name: {
    type: Sequelize.TEXT
  },
});

const getUserRole = () => {
  return UserRole;
}

module.exports.getModel = getUserRole;