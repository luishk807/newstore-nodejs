const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

const Model = require('../../pg/models/UserRoles');
const UserRole = Model.getModel();

router.all('*', cors());

router.get('/userroles', async(req, res, next) => {
  // get statuses
  let userRole = null;
  if (req.query.id) {
    try {
      userRole = await UserRole.findAll({ where: {id: req.query.id}});
      res.json(userRole)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      userRole = await UserRole.findAll();
      res.json(userRole)
    } catch(err) {
      res.send(err)
    }
  }
});

module.exports = router