const Sequelize = require('sequelize');
const pgconfig = require('../config');

const sequelize = pgconfig.getSequelize();

const Status = require('./Statuses');

const BannerImage = sequelize.define('banner_images', {
  bannerId: {
    type: Sequelize.BIGINT
  },
  statusId: {
    type: Sequelize.BIGINT
  },
  img_url: {
    type: Sequelize.TEXT
  },
  position: {
    type: Sequelize.BIGINT
  }
});
// BannerImage.belongsTo(Status, { foreignKey: 'statusId', as: "bannerImageStatus"})
module.exports = BannerImage;