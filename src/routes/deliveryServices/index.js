const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const controller = require('../../controllers/deliveryServices');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../../config');
const s3 = require('../../services/storage.service');
const includes = ['deliveryOptionStatus'];

router.all('*', cors());

router.delete('/:id', verify,  async(req, res, next) => {
  // delete delivery
  try {
    await controller.deleteDeliveryServiceById(req.params.id);
    res.status(200).json({ status: true, message: "Delivery service successfully deleted" });
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  try {
    const delivery = await controller.saveDeliveryService(body, bid);
    res.status(200).json({
      data: delivery,
      status: true,
      message: 'Delivery service Updated'
    });
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  try {
    const delivery = await controller.createDeliveryService(body);
    res.status(200).json(delivery);
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
})

router.get('/:id', async(req, res, next) => {
    try {
      const delivery = await controller.getDeliveryServiceById(req.params.id);
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
      delivery = await controller.getDeliveryServiceById(req.query.id);
      res.status(200).json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      delivery = await controller.getDeliveryServices();
      res.status(200).json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router