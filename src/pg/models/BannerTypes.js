const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Banner = require('./Banners');

const BannerType = sequelize.define('banner_types', {
  name: {
    type: Sequelize.TEXT
  },
  statusId: {
    type: Sequelize.BIGINT
  },
});

BannerType.belongsTo(Banner,{
  foreignKey: "bannerId",
  as: "bannerTypeBanner",
});

module.exports = BannerType;