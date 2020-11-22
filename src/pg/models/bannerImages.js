const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const BannerImages = sequelize.define('banner_images', {
  bannerId: {
    type: Sequelize.BIGINT
  },
  statusId: {
    type: Sequelize.BIGINT
  },
  url: {
    type: Sequelize.TEXT
  },
});

module.exports = BannerImages;