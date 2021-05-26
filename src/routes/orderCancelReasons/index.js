const router = require('express').Router();
const cors = require('cors');
const OrderCancelReason = require('../../pg/models/OrderCancelReasons');
const { checkCorsOrigins } = require('../../utils/server');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));


router.get('/:id', async(req, res, next) => {
    let st = await OrderCancelReason.findAll({ where: {id: req.params.id}});
    res.json(st)
});

router.get('/', async(req, res, next) => {
  // get cancel reason
  let st = null;
  if (req.query.id) {
    try {
      st = await OrderCancelReason.findAll({ where: {id: req.query.id}});
      res.json(st)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      st = await OrderCancelReason.findAll();
      res.json(st)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router