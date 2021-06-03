const pgconfig = require('./config')
const sequelize = pgconfig.getSequelize();

module.exports = sequelize