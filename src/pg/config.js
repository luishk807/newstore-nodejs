const { Client } = require('pg');
const Sequelize = require('sequelize');

const PGUSER = process.env.PGUSER;
const PGPASSWORD = process.env.PGPASSWORD;
const PGPORT = process.env.PGPOST;
const PGHOST = process.env.PGHOST;
const PGDATABASE = process.env.PGDATABASE;

const client = new Client();

client.connect();

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  dialect: 'postgres'
});


const Employee = pgconfig.sequelize.define('employee', {
  name: {
    type: Sequelize.TEXT
  },
  rollnumber: {
    type: Sequelize.INTEGER
  }
});

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

exports.sequelize = sequelize;
