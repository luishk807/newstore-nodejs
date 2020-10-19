const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const User = sequelize.define('user', {
  first_name: {
    type: Sequelize.TEXT
  },
  last_name: {
    type: Sequelize.TEXT
  },
  password: {
    type: Sequelize.TEXT
  },
  email: {
    type: Sequelize.TEXT
  },
  mobile: {
    type: Sequelize.TEXT
  },
  userRoleId: {
    type: Sequelize.BIGINT,
    name: 'userRole',
  },
  phone: {
    type: Sequelize.TEXT
  },
  img: {
    type: Sequelize.TEXT
  },
  statusId: {
    type: Sequelize.BIGINT
  },
  genderId: {
    type: Sequelize.BIGINT
  },
  date_of_birth: {
    type: Sequelize.DATE
  },
});

const getUser = () => {
  return User;
}

module.exports.getModel = getUser;