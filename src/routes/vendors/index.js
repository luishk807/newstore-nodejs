const router = require('express').Router();
const cors = require('cors');
const config = require('../../config.js');
const data = require('../../samples/products.json');

const Model = require('../../pg/models/Vendors');

const Vendor = Model.getModel();

router.all('*', cors());

router.delete('/vendors', (req, res, next) => {
  // delete brands
  client.query('SELECT * FROM vendors where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send(err);
      }
      console.log(result)
      res.status(200).json(result.rows);
  });
});

router.post('/vendors', (req, res, next) => {
  console.log("receive",req)
  // Employee.create(req.body.form).then((employee) => {
  //   res.status(200).json(employee);
  // });
});

router.get('/vendors', async(req, res, next) => {
  Vendor.findAll().then((vendor) => {
      res.status(200).json(vendor);
    });
});

module.exports = router