const router = require('express').Router();
const { Client } = require('pg');
const cors = require('cors');
const Sequelize = require('sequelize');
const config = require('../config.js');
const data = require('../samples/products.json');

// for heroku
const PGUSER = process.env.PGUSER;
const PGPASSWORD = process.env.PGPASSWORD;
const PGPORT = process.env.PGPOST;
const PGHOST = process.env.PGHOST;
const PGDATABASE = process.env.PGDATABASE;
//var connectionString = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGHOST}/${PGDATABASE}`;
//const client = new Client({
//   connectionString: connectionString
// });

const client = new Client();

client.connect();

router.all('*', cors());

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  dialect: 'postgres'
});

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
// sequelize.authenticate().then(() => {
//   console.log('Connection has been established successfully.');
// }).catch(err => {
//   console.error('Unable to connect to the database:', err);
// });

const Employee = sequelize.define('employee', {
  name: {
    type: Sequelize.TEXT
  },
  rollnumber: {
    type: Sequelize.INTEGER
  }
});

router.delete('/products', (req, res, next) => {
  // delete products
  client.query('SELECT * FROM employees where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send(err);
      }
      console.log(result)
      res.status(200).json(result.rows);
  });
});

router.post('/products', (req, res, next) => {
  // add / update products
  client.query('SELECT * FROM employees where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send(err);
      }
      console.log(result)
      res.status(200).json(result.rows);
  });
});

router.get('/products', async(req, res, next) => {
  // get products
  // client.query('SELECT * FROM employee where id = $1', [1], function (err, result) {
  //     if (err) {
  //         res.status(400).send(err);
  //     }
  //     console.log(result)
  //     res.status(200).json(result.rows);
  // });
    Employee.findAll().then((employee) => {
      res.status(200).json(employee);
    });
});

module.exports = router