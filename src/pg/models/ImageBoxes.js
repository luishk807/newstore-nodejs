const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Status = require('./Statuses');
const ImageBoxType = require('./ImageBoxTypes');
const ImageBoxImage = require('./ImageBoxImages');

const ImageBox = sequelize.define('image_boxes', {
  name: {
    type: Sequelize.TEXT
  },
  key: {
    type: Sequelize.TEXT
  },
  imageBoxType: {
    type: Sequelize.BIGINT,
    field: 'imageBoxTypeId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

ImageBox.hasMany(ImageBoxImage, { as: 'productImages'});

ImageBox.belongsTo(Status, { foreignKey: 'statusId', as: "imageBoxStatus"})

ImageBox.belongsTo(ImageBoxType,{
  foreignKey: "imageBoxTypeId",
  as: "imageBoxImageBoxType",
});

ImageBoxImage.belongsTo(ImageBox, { foreignKey: 'imageBoxId', as: 'ImageBoxImageImageBox'});

module.exports = ImageBox;