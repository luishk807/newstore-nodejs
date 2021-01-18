const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Corregimiento = sequelize.define('corregimientos', {
  name: {
    type: Sequelize.TEXT
  },
  province: {
    type: Sequelize.BIGINT,
    field: 'provinceId'
  },
  district: {
    type: Sequelize.BIGINT,
    field: 'districtId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

module.exports = Corregimiento;