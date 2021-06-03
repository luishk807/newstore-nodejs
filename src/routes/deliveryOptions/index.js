const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const controller = require('../../controllers/deliveryOptions');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../../config');
const s3 = require('../../services/storage.service');

router.all('*', cors());

router.delete('/:id', verify,  async(req, res, next) => {
  // delete delivery
  try {
    await controller.deleteDeliveryOptionById(req.params.id);
    res.status(200).json({ status: true, message: "Delivery option successfully deleted" });
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  try {
    const delivery = await controller.saveDeliveryOption(body, bid);
    res.status(200).json({
      data: delivery,
      status: true,
      message: 'Delivery option Updated'
    });
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  try {
    const delivery = await controller.createDeliveryOption(body);
    res.status(200).json(delivery);
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
})

router.get('/:id', async(req, res, next) => {
    try {
      const delivery = await controller.getDeliveryOptionById(req.params.id);
      res.json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err});
    }
});

router.get('/', async(req, res, next) => {
  // get products
  let delivery = null;
  if (req.query.id) {
    try {
      delivery = await controller.getDeliveryOptionById(req.query.id);
      res.status(200).json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      delivery = await controller.getDeliveryOptions();
      res.status(200).json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router