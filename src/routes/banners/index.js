const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

const Banner = require('../../pg/models/banners');

router.all('*', cors());

router.get('/banners', async(req, res, next) => {
  // get statuses
  let banner = null;
  if (req.query.id) {
    try {
      banner = await Banner.findOne({ where: {id: req.query.id}, include:['bannerImages']});
      res.json(banner)
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.type) {
    try {
      banner = await Banner.findOne({ where: {bannerTypeId: req.query.type}, include:['bannerImages']});
      res.json(banner)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      banner = await Banner.findAll({include:['bannerImages']});
      res.json(banner)
    } catch(err) {
      res.send(err)
    }
  }
});

module.exports = router