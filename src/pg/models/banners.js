const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Status = require('./Statuses');
const BannerImage = require('./BannerImages');
const BannerType = require('./BannerTypes');

const Banner = sequelize.define('banners', {
  name: {
    type: Sequelize.TEXT
  },
  bannerType: {
    type: Sequelize.BIGINT,
    field: 'bannerTypeId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

Banner.hasMany(BannerImage, { as: 'productImages'});

Banner.belongsTo(Status, { foreignKey: 'statusId', as: "bannerStatus"})

Banner.belongsTo(BannerType,{
  foreignKey: "bannerTypeId",
  as: "bannerBannerType",
});

BannerImage.belongsTo(Banner, { foreignKey: 'bannerId', as: 'BannerImageBanner'});

module.exports = Banner;