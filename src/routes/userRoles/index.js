const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

const UserRole = require('../../pg/models/UserRoles');

router.all('*', cors());

router.get('/userroles', async(req, res, next) => {
  // get statuses
  let userRole = null;
  if (req.query.id) {
    try {
      userRole = await UserRole.findAll({ where: {id: req.query.id}});
      res.json(userRole)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      userRole = await UserRole.findAll();
      res.json(userRole)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router