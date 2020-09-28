const router = require('express').Router();
const cors = require('cors');
const config = require('../../config.js');
const Model = require('../../pg/models/Categories');

const Category = Model.getModel();

router.all('*', cors());

router.delete('/categories', (req, res, next) => {
  // delete brands
  client.query('SELECT * FROM categories where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send(err);
      }
      console.log(result)
      res.status(200).json(result.rows);
  });
});

router.post('/categories', (req, res, next) => {
  console.log("receive",req)
  // Employee.create(req.body.form).then((employee) => {
  //   res.status(200).json(employee);
  // });
});

router.get('/categories', async(req, res, next) => {
  Category.findAll().then((category) => {
      res.status(200).json(category);
    }).catch((err) => {
      res.send(err)
    })
});

module.exports = router