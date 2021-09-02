// const { Client } = require('pg');
const Sequelize = require('sequelize');
const config = require('../config');

const PGUSER = config.db.user;;
const PGPASSWORD = config.db.password;
const PGPORT = config.db.port;
const PGHOST = config.db.host;
const PGDATABASE = config.db.database;
const logger = global.logger;

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  port: PGPORT,
  dialect: 'postgres',
  logging: msg => { if (logger) { logger.debug(msg) } else { console.log(msg) } }
});

//var connectionString = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGHOST}/${PGDATABASE}`;
//const client = new Client({
//   connectionString: connectionString
// });

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

const getSequelize = () => {
  return sequelize;
}

module.exports.getSequelize = getSequelize;
