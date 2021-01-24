const router = require('express').Router();
const cors = require('cors');
const District = require('../../pg/models/Districts');

router.all('*', cors());

router.get('/', async(req, res, next) => {
  // get statuses
  let district = null;
  if (req.query.id) {
    try {
      district = await District.findAll({ where: {id: req.query.id}});
      res.json(district)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      district = await District.findAll();
      res.json(district)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router