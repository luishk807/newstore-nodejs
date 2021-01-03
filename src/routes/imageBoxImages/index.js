const router = require('express').Router();
const cors = require('cors');
const ImageBoxImage = require('../../pg/models/ImageBoxImages');

router.all('*', cors());

router.delete('/', (req, res, next) => {
  // delete brands
  client.query('SELECT * FROM image_box_images where id = $1', [1], function (err, result) {
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
  if (req.query.imageBox) {
    try {
      imageBox = await ImageBoxImage.findAll({ where: {imageBoxId: req.query.imageBox}, include: ['ImageBoxImageImageBox']});
      res.json(imageBox)
    } catch(err) {
      res.send(err)
    }
  } else {
    ImageBoxImage.findAll({ include: ['ImageBoxImageImageBox']}).then((bimage) => {
      res.status(200).json(bimages);
    }).catch((err) => {
      res.send({status: false, message: err})
    })
  }
});

module.exports = router
