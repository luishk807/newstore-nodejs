const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/orderProducts');

const { checkCorsOrigins } = require('../../utils/server');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));


router.delete('/:id', verify, async(req, res, next) => {
  // delete order
  try {
    const deletedRecord = await controller.deleteOrderProductById(req.params.id);
    if (deletedRecord) {
      res.status(200).json({ status: deletedRecord, message: "Product from order successfully deleted" });
    } else {
      res.status(500).json({status: false, message: err});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  const id = req.params.id;

  try {
    const updated = await controller.updateOrderProduct(req, id);
    if (updated) {
      res.status(200).json({
        data: updated,
        message: 'Order product Updated'
      });
    } else {
      res.status(400).json({ status: false, message: "Error on updated order product!", error: e.toString(), req: req.body });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  try {
    const order = await controller.createOrderProduct(req.body);
    res.status(200).json({
      status: false,
      data: order,
      message: 'product created'
    });
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
})

router.get('/:id', [verify, parser.none()], async(req, res, next) => {
    try {
      const orderProduct = await controller.getOrderProductById(req.params.id);
      res.json(orderProduct)
    } catch(err) {
      res.send(err)
    }
});

router.get('/admin/:id', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const orderProduct = await controller.getOrderProductById(req.params.id);
    res.json(orderProduct)
  } catch(err) {
    res.send(err)
  }
});

router.get('/filters/bulk', [verify, parser.none()],  async(req, res, next) => {
  // get bulk
  console.log(req)
  try {
    const orderProduct = await controller.getOrderProductByIds(req.query.ids);
    res.status(200).json(orderProduct)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/order/:id', [verify, parser.none()], async(req, res, next) => {
  // get by order
  try {
    order = await controller.getOrderProductsByOrderId(req.query.order);
    res.status(200).json(order)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

module.exports = router
