const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const parser = require('../../middlewares/multerParser');
const Order = require('../../pg/models/Orders');
const OrderProduct = require('../../pg/models/OrderProducts');
const Product = require('../../pg/models/Products');
const utils = require('../../controllers/orders');
const sendgrid = require('../../controllers/sendgrid/orders');
const { Op } = require('sequelize');
const includes = ['orderCancelReasons', 'orderStatuses', 'orderUser', 'orderOrderProduct', 'deliveryOrder', 'orderOrderPayment'];
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

router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  const allow = await utils.checkOrderUserId(req, bid);
  if (allow) {
    await utils.saveStatusOrder(req, bid, req.body.orderStatus);
    Order.update(body,
      {
        where: {
          id: bid
        }
      }
    ).then(async(updated) => {
      res.status(200).json({
        status: updated[0] ? true : false,
        message: 'Order Updated'
      });
    })
  } else {
    res.status(401).json({status: false, message: 'not authorized'})
  }
});

router.put('/:id/:cancel', [verify, parser.none()],  async(req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  const cancel = req.params.cancel;
  const allow = await utils.checkOrderUserId(req, bid);
  const url = req.headers.referer;
  const allowedCancelStatus = [1,2];
  Order.findOne({
    where: {
      id: bid
    }
  }).then(async(order) => {
    if (allow) {
      // save status
      if (!allowedCancelStatus.includes(Number(order.orderStatus))) {
        res.status(500).json({status: false, message: "invalid cancel status"})
      } else {
        await utils.saveStatusOrder(req, bid, 7);
        Order.update({
            orderCancelReasonId: cancel,
            orderStatusId: 7
          },{
          where: {
            id: bid
          }
        }).then(async(orderStatus) => {
          await sendgrid.sendOrderCancelRequest(order, req);
  
          res.status(200).json({
            data: order,
            status: true,
            message: 'Order cancellation requested',
          });
        }).catch((err) => {
          res.status(500).json({status: false, message: err})
        })
      }
    } else {
      res.status(401).json({status: false, message: 'not authorized'})
    }
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
    'grandtotal': body.grandtotal,
    'tax': body.tax,
    'totalSaved': body.totalSaved,
    'delivery': body.delivery,
    'shipping_name': body.shipping_name,
    'shipping_address': body.shipping_address,
    'shipping_email': body.shipping_email,
    'shipping_city': body.shipping_city,
    'shipping_country': body.shipping_country,
    'shipping_phone': body.shipping_phone,
    'shipping_province': body.shipping_province,
    'shipping_township': body.shipping_township,
    'shipping_corregimiento': body.shipping_corregimiento,
    'shipping_zip': body.shipping_zip,
    'shipping_zone': body.shipping_zone,
    'shipping_district': body.shipping_district,
    'shipping_note': body.shipping_note,
  }
  
  if (!!!isNaN(body.deliveryOptionId)) {
    entry['deliveryOptionId'] = body.deliveryOptionId;
    entry['deliveryOption'] = body.deliveryOption;
  }
  if (!!!isNaN(body.deliveryServiceId)) {
    entry['deliveryServiceId'] = body.deliveryServiceId;
    entry['deliveryService'] = body.deliveryService;
  }
  if (!!!isNaN(body.paymentOptionId)) {
    entry['paymentOptionId'] = body.paymentOptionId;
    entry['paymentOption'] = body.paymentOption;
  }
  if (!!!isNaN(entryUser)) {
    entry['userId'] = body.userid;
  }

  Order.create(entry).then(async(order) => {
    let cartArry = [];
    await utils.saveStatusOrder(req, order.id, 1);
    const time = Date.now().toString() // '1492341545873'
    const order_num = `${time}${order.id}`;
    const updateCon = await Order.update(
      {'order_number': order_num}, { where: {id: order.id}}
    );
    
    orderObj = {
      entry: entry,
      orderId: order.id,
      order_num: order_num,
      cart: []
    }
    if (Object.keys(carts).length) {
      for(const cart in carts) {
        cartArry.push({
          orderId: order.id,
          productItemId: carts[cart].id,
          unit_total: carts[cart].retailPrice,
          name: carts[cart].productItemProduct.name,
          description: carts[cart].productItemProduct.description,
          model: carts[cart].model,
          color: carts[cart].productItemColor.name,
          sku: carts[cart].sku,
          product: carts[cart].product,
          size: carts[cart].productItemSize.name,
          code: carts[cart].sku,
          productDiscount: carts[cart].discount ? carts[cart].discount.name : null,
          originalPrice: carts[cart].originalPrice,
          savePercentageShow: carts[cart].save_percentag_show,
          savePercentage: carts[cart].save_percentage,
          savePrice: carts[cart].save_price,
          category: carts[cart].productItemProduct.category,
          quantity: carts[cart].quantity,
          total: parseInt(carts[cart].quantity) * parseFloat(carts[cart].retailPrice),
          brand: carts[cart].productItemProduct.brand,
        });
      }
      orderObj.cart = cartArry
      OrderProduct.bulkCreate(cartArry).then(async(orderProducts) => {
        await sendgrid.sendOrderEmail(orderObj, req);
        res.status(200).json({
          status: true,
          data: orderObj,
          message: 'Order Created'
        });
      })
    } else {
      await sendgrid.sendOrderEmail(orderObj, req);
      res.status(200).json({
        status: false,
        data: orderObj,
        message: 'Order Created but unable to send email'
      });
    }
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/:order_number/:email', [parser.none()], async(req, res, next) => {
    try {
      const order = await Order.findOne({ where: {order_number: req.params.order_number, shipping_email: req.params.email, userId: null}, include: includes, order: orderBy});
      res.status(200).json(order)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
});

router.get('/:id', [verify, parser.none()], async(req, res, next) => {
  // let order = null;
  if (req.user.type == '1') {
    order = await Order.findOne({ where: {id: Number(req.params.id)}, include: includes, order: orderBy });
    res.status(200).json(order)
  } else {
    order = await Order.findOne({ where: {id: req.params.id, userId: req.user.id}, include: includes, order: orderBy });
    if (order) {
      res.status(200).json(order)
    } else {
      res.status(401).json({status: false, message: 'not authorized'})
    }
  }
});

router.get('/:user/by-user', [verify, parser.none()], async(req, res, next) => {
  if (req.user.type == '1') {
    const order = await Order.findAll({ where: {userId: req.params.user}, include: includes, order: orderBy });
    res.status(200).json(order)
  } else {
    res.status(401).json({status: false, message: 'not authorized'})
  }
});

router.get('/admin/orders/all', [verify, parser.none()], async(req, res, next) => {
  if (req.user.type == '1') {
    const order = await Order.findAll({include: includes, order: orderBy});
    res.status(200).json(order)
  } else {
    res.status(401).json({status: false, message: 'not authorized'})
  }
});

router.get('/', [verify, parser.none()], async(req, res, next) => {
  // get orders
  try {
    const order = await Order.findAll({ where: {userId: req.user.id}, include: includes, order: orderBy});
    res.status(200).json(order)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

module.exports = router
