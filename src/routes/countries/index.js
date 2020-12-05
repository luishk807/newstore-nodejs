const router = require('express').Router();
const cors = require('cors');
const Country = require('../../pg/models/Countries');

router.all('*', cors());

router.get('/', async(req, res, next) => {
  // get statuses
  let country = null;
  if (req.query.id) {
    try {
      country = await Country.findAll({ where: {id: req.query.id}});
      res.json(country)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      country = await Country.findAll({
        attributes: ['id', ['nicename', 'name']] //id, first AS firstName
      });
      res.json(country)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router