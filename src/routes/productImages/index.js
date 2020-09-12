const router = require('express').Router();
const cors = require('cors');
const config = require('../../config.js');

const Model = require('../../pg/models/ProductImages');

const ProductImage = Model.getModel();

router.all('*', cors());

router.delete('/product-images', (req, res, next) => {
  // delete brands
  client.query('SELECT * FROM product_images where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send(err);
      }
      console.log(result)
      res.status(200).json(result.rows);
  });
});

router.post('/product-images', (req, res, next) => {
  console.log("receive",req)
  // Employee.create(req.body.form).then((employee) => {
  //   res.status(200).json(employee);
  // });
});

router.get('/product-images', async(req, res, next) => {
  ProductImage.findAll().then((pimage) => {
      res.status(200).json(pimages);
    });
});

module.exports = router