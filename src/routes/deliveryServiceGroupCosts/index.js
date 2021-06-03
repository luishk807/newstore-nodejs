const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const controller = require('../../controllers/deliveryServiceGroupCosts');
const parser = require('../../middlewares/multerParser');

router.all('*', cors());

router.delete('/:id', verify,  async(req, res, next) => {
  // delete delivery
  try {
    await controller.deleteDeliveryServiceGroupCostById(req.params.id);
    res.status(200).json({ status: true, message: "Delivery service cost successfully deleted" });
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  try {
    const delivery = await controller.saveDeliveryServiceGroupCost(body, bid);
    if (delivery.status) {
      res.status(200).json({
        data: delivery,
        status: true,
        message: 'Delivery service updated'
      });
    } else {
      res.status(400).json(delivery);
    }
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  try {
    const delivery = await controller.createDeliveryServiceGroupCost(body);
    if (delivery.status) {
      res.status(200).json({
        data: delivery,
        status: true,
        message: 'Delivery service created'
      });
    } else {
      res.status(400).json(delivery);
    }

  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
})

router.get('/:id', async(req, res, next) => {
    try {
      const delivery = await controller.getDeliveryServiceGroupCostById(req.params.id);
      res.json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err});
    }
});

router.get('/filter/search/cost', [parser.none()], async(req, res, next) => {
  const body = req.query;
  try {
    const query = {
      deliveryService: body.service ? body.service : null,
      zone: body.zone ? body.zone : null,
      corregimiento: body.corregimiento ? body.corregimiento : null
    }

    const delivery = await controller.getDeliveryServiceGroupCostByFilter(query);
    res.json(delivery)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/option/:id/cost', [parser.none()], async(req, res, next) => {
  const body = req.params;
  try {
    const query = {
      deliveryOption: body.id
    }
    const delivery = await controller.getAllDeliveryServiceGroupCostByFilter(query);
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
      delivery = await controller.getDeliveryServiceGroupCostById(req.query.id);
      res.status(200).json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      delivery = await controller.getDeliveryServiceGroupCosts();
      res.status(200).json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router