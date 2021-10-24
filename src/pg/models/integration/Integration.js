const Sequelize = require('sequelize');
const pgconfig = require('../../config');
const sequelize = pgconfig.getSequelize();

const Integration = sequelize.define('integration', {
    id: {
        type: Sequelize.TEXT,
        primaryKey: true
    },
    realmId: {
        type: Sequelize.TEXT
    },
    accessJson: {
        type: Sequelize.TEXT
    },
    accessUpdated: {
        type: Sequelize.DATE
    },
    refreshTokenUpdated: {
        type: Sequelize.DATE
    }
  }, {
        freezeTableName: true,
        timestamps: false
  });
  
  module.exports = Integration;
