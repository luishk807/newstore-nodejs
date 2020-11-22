const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const BannerImage = sequelize.define('banner_images', {
  banner: {
    type: Sequelize.BIGINT,
    field: 'bannerId'
  },
  statusId: {
    type: Sequelize.BIGINT
  },
  url: {
    type: Sequelize.TEXT
  },
});

module.exports = BannerImage;