const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

const Model = require('../../pg/models/Genders');
const Gender = Model.getModel();

router.all('*', cors());

router.get('/genders', async(req, res, next) => {
  // get statuses
  let gender = null;
  if (req.query.id) {
    try {
      gender = await Gender.findAll({ where: {id: req.query.id}});
      res.json(gender)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      gender = await Gender.findAll();
      res.json(gender)
    } catch(err) {
      res.send(err)
    }
  }
});

module.exports = router