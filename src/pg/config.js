const { Client } = require('pg');
const Sequelize = require('sequelize');

const PGUSER = process.env.PGUSER;
const PGPASSWORD = process.env.PGPASSWORD;
const PGPORT = process.env.PGPORT;
const PGHOST = process.env.PGHOST;
const PGDATABASE = process.env.PGDATABASE;

const client = new Client();

client.connect();

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  port: PGPORT,
  dialect: 'postgres'
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
