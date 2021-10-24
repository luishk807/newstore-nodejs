const Sequelize = require('sequelize');
const pgconfig = require('../../config');
const sequelize = pgconfig.getSequelize();

const QuickbooksRef = sequelize.define('integration_qb_ref', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    type: { // Type of Quickbooks object
        type: Sequelize.CHAR
    },
    local_id: {
        type: Sequelize.BIGINT
    },
    external_id: {
        type: Sequelize.BIGINT
    },
    created_at: {
        type: Sequelize.DATE
    }
}, {
    freezeTableName: true,
    timestamps: false
});
  
module.exports = QuickbooksRef;
