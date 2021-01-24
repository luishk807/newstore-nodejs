const router = require('express').Router();
const cors = require('cors');
const Corregimiento = require('../../pg/models/Corregimientos');

router.all('*', cors());

router.get('/', async(req, res, next) => {
  // get statuses
  let corregimientos = null;
  if (req.query.id) {
    try {
      corregimientos = await Corregimiento.findAll({ where: {id: req.query.id}});
      res.json(corregimientos)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      corregimientos = await Corregimiento.findAll();
      res.json(corregimientos)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router