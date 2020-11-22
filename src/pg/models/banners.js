const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const BannerImages = require('./bannerImages');

const Banner = sequelize.define('banner_boxes', {
  name: {
    type: Sequelize.TEXT
  },
  bannerTypeId: {
    type: Sequelize.BIGINT
  },
  statusId: {
    type: Sequelize.BIGINT
  },
});

Banner.hasMany(BannerImages, { as: 'bannerImages'});

BannerImages.belongsTo(Banner, { foreignKey: 'bannerId', as: 'banner'});

module.exports = Banner;