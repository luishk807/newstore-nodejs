const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const PromotionCode = sequelize.define('promotion_codes', {
  price: {
    type: Sequelize.FLOAT
  },
  name: {
    type: Sequelize.TEXT
  },
  promoCode: {
    type: Sequelize.TEXT
  },
  startDate: {
    type: Sequelize.DATE
  },
  endDate: {
    type: Sequelize.DATE
  },
  percentage: {
    type: Sequelize.FLOAT
  },
  useDate: {
    type: Sequelize.BOOLEAN
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

module.exports = PromotionCode;

PromotionCode.belongsTo(Statuses, { foreignKey: 'statusId', as: 'promotionCodeStatus'});