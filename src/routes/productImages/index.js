const router = require('express').Router();
const cors = require('cors');
const config = require('../../config.js');

const ProductImage = require('../../pg/models/ProductImages');

router.all('*', cors());

router.delete('/product-images', (req, res, next) => {
  // delete brands
  client.query('SELECT * FROM product_images where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send({status: false, message: err});
      }
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
  ProductImage.findAll({ include: ['ProductImageProduct']}).then((pimage) => {
      res.status(200).json(pimages);
    }).catch((err) => {
      res.send({status: false, message: err})
    })
});

module.exports = router