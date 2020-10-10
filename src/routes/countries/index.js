const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

const Model = require('../../pg/models/Countries');
const Country = Model.getModel();

router.all('*', cors());

router.get('/countries', async(req, res, next) => {
  // get statuses
  let country = null;
  if (req.query.id) {
    try {
      country = await Country.findAll({ where: {id: req.query.id}});
      res.json(country)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      country = await Country.findAll({
        attributes: ['id', ['nicename', 'name']] //id, first AS firstName
      });
      res.json(country)
    } catch(err) {
      res.send(err)
    }
  }
});

module.exports = router