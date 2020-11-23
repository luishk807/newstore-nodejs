const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const SweetBoxProduct = require('./SweetBoxesProducts');

const Status = require('./Statuses');

const SweetBox = sequelize.define('sweet_boxes', {
  name: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

SweetBox.hasMany(SweetBoxProduct, { as: 'sweetBoxSweetboxProduct'});

SweetBox.belongsTo(Status, { foreignKey: 'statusId', as: 'sweetboxesStatus'});

module.exports = SweetBox;