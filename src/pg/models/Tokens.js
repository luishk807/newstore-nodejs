const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const User = require('./Users');

const Token = sequelize.define('tokens', {
  user: {
    type: Sequelize.BIGINT,
    field: 'userId',
  },
  token: {
    type: Sequelize.TEXT
  },
  createdAt: {
    type: Sequelize.DATE
  }
});

Token.belongsTo(User, { foreignKey: 'userId', as: 'tokenUsers'});

module.exports = Token;