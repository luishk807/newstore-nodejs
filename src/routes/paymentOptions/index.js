const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const controller = require('../../controllers/paymentOptions');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../../config');
const s3 = require('../../services/storage.service');
const { checkCorsOrigins } = require('../../utils/server');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));

router.delete('/:id', verify,  async(req, res, next) => {
  // delete delivery
  try {
    await controller.deletePaymentOptionById(req.params.id);
    res.status(200).json({ status: true, message: "Payment option successfully deleted" });
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  try {
    const product = await controller.savePaymentOption(body, bid);
    res.status(200).json({
      status: true,
      data: product,
      message: 'Payment option Updated'
    });
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  try {
    const product = await controller.createPaymentOption(body);
    res.status(200).json({
      data: delivery,
      status: true,
      message: 'Payment option service created'
    });
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
})

router.get('/active-payments', async(req, res, next) => {
  // get products
  try {
    paymentOption = await controller.getActivePaymentOptions();
    res.status(200).json(paymentOption)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/:id', async(req, res, next) => {
  try {
    const delivery = await controller.getPaymentOptionById(req.params.id);
    res.json(delivery)
  } catch(err) {
    res.send(err)
  }
});

router.get('/', async(req, res, next) => {
  // get products
  let paymentOption = null;
  if (req.query.id) {
    try {
      paymentOption = await controller.getPaymentOptionById(req.query.id);
      res.status(200).json(paymentOption)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      paymentOption = await controller.getPaymentOptions();
      res.status(200).json(paymentOption)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router