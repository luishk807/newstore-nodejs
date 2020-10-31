const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

const WorkRole = require('../../pg/models/WorkRoles');

router.all('*', cors());

router.get('/workroles/:id', async(req, res, next) => {
    let workRole = await WorkRole.findAll({ where: {id: req.params.id}});
    res.json(workRole)
});

router.get('/workroles', async(req, res, next) => {
  // get statuses
  let workRole = null;
  if (req.query.id) {
    try {
      workRole = await WorkRole.findAll({ where: {id: req.query.id}});
      res.json(workRole)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      workRole = await WorkRole.findAll();
      res.json(workRole)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router