const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Status = require('./Statuses');
// const BannerImage = require('./BannerImages');
const BannerType = require('./BannerTypes');
const BannerImg = require('./BannerImg');

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

Banner.hasMany(BannerImg, { as: 'productImages'});

Banner.belongsTo(Status, { foreignKey: 'statusId', as: "bannerStatus"})

Banner.belongsTo(BannerType,{
  foreignKey: "bannerTypeId",
  as: "bannerBannerType",
});

BannerImg.belongsTo(Banner, { foreignKey: 'bannerId', as: 'BannerImageBanner'});

module.exports = Banner;