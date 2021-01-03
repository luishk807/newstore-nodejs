const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ImageBoxImage = sequelize.define('image_box_images', {
  imageBox: {
    type: Sequelize.BIGINT,
    field: 'imageBoxId'
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

module.exports = ImageBoxImage;