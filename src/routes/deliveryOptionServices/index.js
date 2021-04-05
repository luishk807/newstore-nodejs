const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const controller = require('../../controllers/deliveryOptionServices');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../../config');

router.all('*', cors());

router.delete('/:id', verify,  async(req, res, next) => {
  // delete delivery
  try {
    await controller.deleteDeliveryOptionServiceById(req.params.id);
    res.status(200).json({ status: true, message: "Delivery option service successfully deleted" });
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  try {
    const delivery = await controller.saveDeliveryOptionService(body, bid);
    if (delivery) {
      res.status(200).json({
        data: delivery,
        status: true,
        message: 'Delivery option service Updated'
      });
    } else {
      res.status(200).json({
        data: delivery,
        status: false,
        message: 'Unable to save service or duplicate service found'
      });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  try {
    const delivery = await controller.createDeliveryOptionService(body);
    if (delivery) {
      res.status(200).json({
        data: delivery,
        status: true,
        message: 'Delivery option service created'
      });
    } else {
      res.status(200).json({
        data: delivery,
        status: false,
        message: 'Unable to create service or duplicate service found'
      });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
})

router.get('/a/delivery-option/:id', async(req, res, next) => {
  try {
    const delivery = await controller.getActiveDeliveryOptionServiceByDeliveryOptionId(req.params.id);
    res.json(delivery)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/delivery-option/:id', async(req, res, next) => {
  try {
    const delivery = await controller.getDeliveryOptionServiceByDeliveryOptionId(req.params.id);
    res.json(delivery)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/ac-options', async(req, res, next) => {
  try {
    const delivery = await controller.getActiveDeliveryOptionServices();
    res.json(delivery)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/:id', async(req, res, next) => {
    try {
      const delivery = await controller.getDeliveryOptionServiceById(req.params.id);
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
      delivery = await controller.getDeliveryOptionServiceById(req.query.id);
      res.status(200).json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      delivery = await controller.getDeliveryOptionServices();
      res.status(200).json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router