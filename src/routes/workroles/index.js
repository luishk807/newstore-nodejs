const router = require('express').Router();
const cors = require('cors');
const WorkRole = require('../../pg/models/WorkRoles');

router.all('*', cors());

router.get('/:id', async(req, res, next) => {
    let workRole = await WorkRole.findAll({ where: {id: req.params.id}});
    res.json(workRole)
});

router.get('/', async(req, res, next) => {
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