const router = require('express').Router();
const cors = require('cors');
const Province = require('../../pg/models/Provinces');

router.all('*', cors());

router.get('/', async(req, res, next) => {
  // get statuses
  let province = null;
  if (req.query.id) {
    try {
      province = await Province.findAll({ where: {id: req.query.id}});
      res.json(province)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      province = await Province.findAll();
      res.json(province)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router