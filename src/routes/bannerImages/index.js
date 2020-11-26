const router = require('express').Router();
const cors = require('cors');
const config = require('../../config.js');

const BannerImage = require('../../pg/models/BannerImages');

router.all('*', cors());

router.delete('/banner-images', (req, res, next) => {
  // delete brands
  // client.query('SELECT * FROM banner_images where id = $1', [1], function (err, result) {
  //     if (err) {
  //         res.status(400).send({status: false, message: err});
  //     }
  //     res.status(200).json(result.rows);
  // });
});

router.post('/banner-images', (req, res, next) => {
  console.log("receive",req)
  // Employee.create(req.body.form).then((employee) => {
  //   res.status(200).json(employee);
  // });
});

router.get('/banner-images', async(req, res, next) => {
  // BannerImage.findAll({ include: ['BannerImageBanner']}).then((bimage) => {
  BannerImage.findAll().then((bimage) => {
    res.status(200).json(bimages);
  }).catch((err) => {
    res.send({status: false, message: err})
  })
});

module.exports = router