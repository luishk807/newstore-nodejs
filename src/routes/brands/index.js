const router = require('express').Router();
const cors = require('cors');
const config = require('../../config.js');
const data = require('../../samples/products.json');

const Model = require('../../pg/models/Brands');

const Brand = Model.getModel();

router.all('*', cors());

router.delete('/brands', (req, res, next) => {
  // delete brands
  client.query('SELECT * FROM brands where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send(err);
      }
      console.log(result)
      res.status(200).json(result.rows);
  });
});

router.post('/brands', (req, res, next) => {
  console.log("receive",req)
  // Employee.create(req.body.form).then((employee) => {
  //   res.status(200).json(employee);
  // });
});

router.get('/brands', async(req, res, next) => {
  Brand.findAll().then((brand) => {
      res.status(200).json(brand);
    });
});

module.exports = router