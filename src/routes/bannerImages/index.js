const router = require('express').Router();
const cors = require('cors');
const BannerImg = require('../../pg/models/BannerImg');

router.all('*', cors());

router.delete('/', (req, res, next) => {
  // delete brands
  client.query('SELECT * FROM banner_images where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send({status: false, message: err});
      }
      res.status(200).json(result.rows);
  });
});

router.post('/', (req, res, next) => {
  console.log("receive",req)
  // Employee.create(req.body.form).then((employee) => {
  //   res.status(200).json(employee);
  // });
});

router.get('/', async(req, res, next) => {
  BannerImg.findAll({ include: ['BannerImageBanner']}).then((bimage) => {
    res.status(200).json(bimages);
  }).catch((err) => {
    res.send({status: false, message: err})
  })
});

module.exports = router
