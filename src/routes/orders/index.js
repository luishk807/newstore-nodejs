const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const parser = require('../../middlewares/multerParser');
const Order = require('../../pg/models/Orders');
const OrderProduct = require('../../pg/models/OrderProducts');
const sendgrid = require('../../controllers/sendGrid');
const { Op } = require('sequelize');
const includes = ['orderCancelReasons', 'orderStatuses', 'orderUser', 'orderOrderProduct'];
const orderBy = [['createdAt', 'DESC'], ['updatedAt', 'DESC']];
router.all('*', cors());

router.delete('/:id', verify, (req, res, next) => {
  // delete order
  Order.findAll({ where: {id: req.params.id}})
  .then((order) => {
    Order.destroy({
      where: {
        id: order[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({ status: deletedRecord, message: "Order successfully deleted" });
    }, (err) => {
      res.status(500).json({status: false, message: err});
    })
  })
});

router.put('/:id', [verify, parser.none()], (req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  Order.update(
    {
      'name': body.name,
      'orderStatus': body.orderStatus,
      'userId': body.userId,
      'subtotal': body.subtotal,
      'grandtotal': body.grandtotal,
      'tax': body.tax,
      'delivery': body.delivery,
      'orderCancelReason': body.orderCancelReason,
      'shipping_name': body.shipping_name,
      'shipping_address': body.shipping_address,
      'shipping_email': body.shipping_email,
      'shipping_city': body.shipping_city,
      'shipping_country': body.shipping_country,
      'shipping_province': body.shipping_province,
      'shipping_township': body.shipping_township,
      'shipping_corregimiento': body.shipping_corregimiento,
      'shipping_zip': body.shipping_zip,
      'shipping_district': body.shipping_district,

    },
    {
      where: {
        id: bid
      }
    }
  ).then((updated) => {

    res.status(200).json({
      data: updated,
      message: 'Order Updated'
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [parser.none()], async(req, res, next) => {
  const body = req.body;
  const carts = JSON.parse(body.cart);
  const entryUser = parseInt(body.userid);
  let entry = {
    'subtotal': body.subtotal,
    'grandtotal': body.grandTotal,
    'tax': body.tax,
    'delivery': body.delivery,
    'shipping_name': body.shipping_name,
    'shipping_address': body.shipping_address,
    'shipping_email': body.shipping_email,
    'shipping_city': body.shipping_city,
    'shipping_country': body.shipping_country,
    'shipping_province': body.shipping_province,
    'shipping_township': body.shipping_township,
    'shipping_corregimiento': body.shipping_corregimiento,
    'shipping_zip': body.shipping_zip,
    'shipping_district': body.shipping_district,
  }
  
  if (!!!isNaN(entryUser)) {
    entry['userId'] = body.userid;
  }
  Order.create(entry).then(async(order) => {
    let cartArry = [];
    const time = Date.now().toString() // '1492341545873'
    const order_num = `${time}${order.id}`;
    const updateCon = await Order.update(
      {'order_number': order_num}, { where: {id: order.id}}
    );
    
    orderObj = {
      order_num: order_num,
      cart: []
    }
    if (Object.keys(carts).length) {
      for(const cart in carts) {
        cartArry.push({
          orderId: order.id,
          productId: carts[cart].id,
          unit_total: carts[cart].amount,
          name: carts[cart].name,
          description: carts[cart].description,
          model: carts[cart].model,
          code: carts[cart].code,
          category: carts[cart].category,
          quantity: carts[cart].quantity,
          total: parseInt(carts[cart].quantity) * parseFloat(carts[cart].amount),
          brand: carts[cart].brand,
        })
      }
      orderObj.cart = cartArry
      OrderProduct.bulkCreate(cartArry).then(async(orderProducts) => {
        await sendgrid.sendOrderEmail(body.shipping_email, orderObj, 'order received', 'order process');
        res.status(200).json({
          status: true,
          data: order,
          message: 'Order Created'
        });
      })
    } else {
      await sendgrid.sendOrderEmail(body.shipping_email, orderObj, 'order received', 'order process');
      res.status(200).json({
        status: false,
        data: order,
        message: 'Order Created'
      });
    }
  }).catch((err) => {
    console.log(err)
    res.status(500).json({status: false, message: err})
  })
})

router.get('/:id', [verify, parser.none()], async(req, res, next) => {
    const order = await Order.findAll({ where: {id: req.params.id, userId: req.query.user}, include: includes});
    res.json(order)
});

router.get('/', [verify, parser.none()], async(req, res, next) => {
  // get orders
  let order = null;
  if (req.query.id) {
    try {
      order = await Order.findOne({ where: {id: req.query.id}, include: includes, order: orderBy});
      res.status(200).json(order)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      order = await Order.findAll({ where: {userId: req.user.id}, include: includes, order: orderBy });
      res.status(200).json(order)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

router.get('/my-orders', [verify, parser.none()], async(req, res, next) => {
  // get orders
  let order = null;
  if (req.query.id) {
    try {
      order = await Order.findOne({ where: {id: req.query.id, userId: req.query.user}, include: includes});
      res.status(200).json(order)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      order = await Order.findAll({ where: {userId: req.query.user}, include: includes });
      res.status(200).json(order)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router
