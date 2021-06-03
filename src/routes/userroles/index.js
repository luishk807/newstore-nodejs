const router = require('express').Router();
const cors = require('cors');
const UserRole = require('../../pg/models/UserRoles');
const { checkCorsOrigins } = require('../../utils/server');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));

router.get('/', async(req, res, next) => {
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