const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Status = require('./Statuses');

const BannerType = sequelize.define('banner_types', {
  name: {
    type: Sequelize.TEXT
  },
  statusId: {
    type: Sequelize.BIGINT,
  },
});
BannerType.belongsTo(Status, { foreignKey: 'statusId', as: "bannerTypeStatus"})
module.exports = BannerType;