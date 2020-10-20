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
  userRole: {
    type: Sequelize.BIGINT,
    field: 'userRoleId',
  },
  phone: {
    type: Sequelize.TEXT
  },
  img: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId',
  },
  gender: {
    type: Sequelize.BIGINT,
    field: 'genderId',
  },
  date_of_birth: {
    type: Sequelize.DATE
  },
});

const getUser = () => {
  return User;
}

module.exports.getModel = getUser;