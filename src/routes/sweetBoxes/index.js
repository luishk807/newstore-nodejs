const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const verify = require('../verifyToken');

const SweetBox = require('../../pg/models/SweetBoxes');

router.all('*', cors());

router.get('/sweetboxes', async(req, res, next) => {
  // get statuses
  let sweetbox = null;
  if (req.query.id) {
    try {
      sweetbox = await SweetBox.findOne({ where: {id: req.query.id}});
      res.json(sweetbox)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      sweetbox = await SweetBox.findAll();
      res.json(sweetbox)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router