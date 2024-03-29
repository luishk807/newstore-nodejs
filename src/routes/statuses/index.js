const router = require('express').Router();
const cors = require('cors');
const Status = require('../../pg/models/Statuses');

router.all('*', cors());

router.get('/:id', async(req, res, next) => {
    let product = await Status.findAll({ where: {id: req.params.id}});
    res.json(product)
});

router.get('/', async(req, res, next) => {
  // get statuses
  let product = null;
  if (req.query.id) {
    try {
      product = await Status.findAll({ where: {id: req.query.id}});
      res.json(product)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      product = await Status.findAll();
      res.json(product)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router