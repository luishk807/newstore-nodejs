const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/orders');
const { checkCorsOrigins } = require('../../utils/server');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));


router.delete('/:id', verify, async(req, res, next) => {
  // delete order
  try {
    const resp = await controller.deleteOrderById(req.params.id, req.user);
    if (resp) {
      res.status(200).json({ status: true, message: "Order successfully deleted" });
    } else {
      res.status(500).json({status: false, message: "Unable to delete order, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  try {
    const resp = await controller.updateOrder(req);
    if (resp) {
      res.status(200).json({ status: true, message: "Order successfully updated" });
    } else {
      res.status(500).json({status: false, message: "Unable to update order, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id/:cancel', [verify, parser.none()],  async(req, res, next) => {
  try {
    const resp = await controller.cancelOrder(req);
    if (resp) {
      res.status(200).json({ status: true, message: "Order cancellation requested" });
    } else {
      res.status(500).json({status: false, message: "Unable to cancel order, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.post('/', [parser.none()], async(req, res, next) => {
  try {
    const resp = await controller.createOrder(req);
    if (resp) {
      res.status(200).json({ status: true, data: resp, message: "Order Created" });
    } else {
      res.status(500).json({status: false, message: "Unable to create order, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
})

router.get('/:order_number/:email', [parser.none()], async(req, res, next) => {
    const body = req.params;

    if (!body || !body.order_number || !body.email) {
      res.status(500).json({status: false, message: "Unable to find order"});
    }
    
    try {
      const resp = await controller.getOrderByOrderNumberEmail(req.params.order_number, req.params.email);
      res.status(200).json(resp)
    } catch(err) {
      res.status(500).json({status: false, message: err});
    }
});

router.get('/:id', [verify, parser.none()], async(req, res, next) => {
  // let order = null;
  const body = req.params;

  if (!body || !body.id) {
    res.status(500).json({status: false, message: "Unable to find order"});
  }
  
  try {
    const order = await controller.getOrderById(req.params.id, req.user);
    res.status(200).json(order)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }

});

router.get('/:user/by-user', [verify, parser.none()], async(req, res, next) => {
  const body = req.params;

  if (!body || !body.id) {
    res.status(500).json({status: false, message: "Unable to find order"});
  }
  
  try {
    const order = await controller.getOrderByUser(req.user, req.params.user);
    res.status(200).json(order)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/admin/orders/all', [verify, parser.none()], async(req, res, next) => {
  try {
    const order = await controller.getAllOrder(req.user);
    res.status(200).json(order)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/', [verify, parser.none()], async(req, res, next) => {
  // get orders
  try {
    const order = await controller.getMyOrders(req.user);
    res.status(200).json(order)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

module.exports = router
