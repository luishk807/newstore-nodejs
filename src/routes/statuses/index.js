const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

const Model = require('../../pg/models/Statuses');
const Status = Model.getModel();

router.all('*', cors());

router.get('/statuses/:id', async(req, res, next) => {
    let product = await Status.findAll({ where: {id: req.params.id}});
    res.json(product)
});

router.get('/statuses', async(req, res, next) => {
  // get statuses
  let product = null;
  if (req.query.id) {
    try {
      product = await Status.findAll({ where: {id: req.query.id}});
      res.json(product)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      product = await Status.findAll();
      res.json(product)
    } catch(err) {
      res.send(err)
    }
  }
});

module.exports = router