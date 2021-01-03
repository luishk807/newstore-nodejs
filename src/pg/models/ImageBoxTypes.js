const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Status = require('./Statuses');

const ImageBoxType = sequelize.define('image_box_types', {
  name: {
    type: Sequelize.TEXT
  },
  statusId: {
    type: Sequelize.BIGINT,
  },
});
ImageBoxType.belongsTo(Status, { foreignKey: 'statusId', as: "imageBoxTypeStatus"})
module.exports = ImageBoxType;