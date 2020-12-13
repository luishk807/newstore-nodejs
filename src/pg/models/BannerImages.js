const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const BannerImage = sequelize.define('banner_images', {
  banner: {
    type: Sequelize.BIGINT,
    field: 'bannerId'
  },
  img_url: {
    type: Sequelize.TEXT
  },
  position: {
    type: Sequelize.BIGINT
  },
  url: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

module.exports = BannerImage;