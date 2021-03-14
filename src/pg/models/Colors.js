const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const Color = sequelize.define('colors', {
  name: {
    type: Sequelize.TEXT
  },
  color: {
    type: Sequelize.BIGINT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

Color.belongsTo(Statuses, { foreignKey: 'statusId', as: 'colorStatus'});

module.exports = Color;