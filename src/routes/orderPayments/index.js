const router = require('express').Router();
const cors = require('cors');
const controller = require('../../controllers/orderPayments');
const { checkCorsOrigins } = require('../../utils/server');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));


router.get('/:id', async(req, res, next) => {
    try {
      const product = await controller.getOrderPaymentById(req.params.id);
      res.json(product)
    } catch(err) {
      res.send(err)
    }
});

router.get('/order/:id', async(req, res, next) => {
  try {
    const product = await controller.getOrderPaymentByOrderId(req.params.id);
    res.json(product)
  } catch(err) {
    res.send(err)
  }
});


router.get('/', async(req, res, next) => {
  // get cancel reason
  let st = null;
  if (req.query.id) {
    try {
      st = await controller.getOrderPaymentById(req.query.id);
      res.json(st)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      st = await controller.getOrderPayments();
      res.json(st)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router