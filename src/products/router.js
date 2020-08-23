const router = require('express').Router();
const cors = require('cors');
const config = require('../config.js');
const data = require('../samples/products.json');

const EmployeeModel = require('../pg/models/Employees');

const Employee = EmployeeModel.getEmployeeModel();

router.all('*', cors());

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
  // client.query('SELECT * FROM employees where id = $1', [1], function (err, result) {
  //     if (err) {
  //         res.status(400).send(err);
  //     }
  //     console.log(result)
  //     res.status(200).json(result.rows);
  // });
  Employee.create(req.body.form).then((employee) => {
    res.status(200).json(employee);
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