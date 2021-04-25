const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const SweetBoxProduct = require('./SweetBoxProducts');

const SweetBoxType = require('./SweetBoxTypes');

const Status = require('./Statuses');

const SweetBox = sequelize.define('sweet_boxes', {
  name: {
    type: Sequelize.TEXT
  },
  key: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
  sweetBoxType: {
    type: Sequelize.BIGINT,
    field: 'sweetBoxTypeId'
  },
});

SweetBox.hasMany(SweetBoxProduct, { as: 'sweetBoxSweetboxProduct', foreignKey: 'sweetBoxId'});

SweetBox.belongsTo(Status, { foreignKey: 'statusId', as: 'sweetboxesStatus'});

SweetBox.belongsTo(SweetBoxType, { foreignKey: 'sweetBoxTypeId', as: 'sweetBoxTypeSweetBox'});

module.exports = SweetBox;