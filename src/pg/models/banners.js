const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const BannerImage = require('./bannerImages');

const Banner = sequelize.define('banners', {
  name: {
    type: Sequelize.TEXT
  },
  bannerType: {
    type: Sequelize.BIGINT,
    field: 'bannerTypeId'
  },
  statusId: {
    type: Sequelize.BIGINT
  },
});

Banner.hasMany(BannerImage, { as: 'bannerBannerImages'});

module.exports = Banner;