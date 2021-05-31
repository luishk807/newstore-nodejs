const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const parser = require('../../middlewares/multerParser');
const OrderProduct = require('../../pg/models/OrderProducts');
const Order = require('../../pg/models/Orders');
const { Op } = require('sequelize');
const utils = require('../../controllers/orders');

const includes = ['orderStatusProduct', 'orderProductItem', 'orderProductProductDiscount'];

const { checkCorsOrigins } = require('../../utils/server');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));


router.delete('/:id', verify, (req, res, next) => {
  // delete order
  OrderProduct.findAll({ where: {id: req.params.id}})
  .then((order) => {
    OrderProduct.destroy({
      where: {
        id: order[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({ status: deletedRecord, message: "Product from order successfully deleted" });
    }, (err) => {
      res.status(500).json({status: false, message: err});
    })
  })
});

router.put('/:id', [verify, parser.none()], (req, res, next) => {
  const body = req.body;
  const bid = req.params.id;

  OrderProduct.update(
    {
      'product': body.productId,
      'quantity': body.quantity,
      'total': body.total,
      'order': body.order,
      'orderStatus': body.orderStatus,
      'name': body.name,
      'unit_total': body.unit_total,
      'description': body.description,
      'model': body.model,
      'code': body.code,
      'category': body.category,
      'brand': body.brand,
      'color': body.color,
      'size': body.size,
      'productDiscount': body.productDiscount
    },
    {
      where: {
        id: bid
      }
    }
  ).then((updated) => {
    res.status(200).json({
      data: updated,
      message: 'Order product Updated'
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  let entry = {
    'product': body.productId,
    'quantity': body.quantity,
    'total': body.total,
    'order': body.order,
    'orderStatus': body.orderStatus,
    'name': body.name,
    'unit_total': body.unit_total,
    'description': body.description,
    'model': body.model,
    'code': body.code,
    'category': body.category,
    'brand': body.brand,
    'color': body.color,
    'size': body.size,
    'productDiscount': body.productDiscount
  }
  OrderProduct.create(entry).then(async(order) => {
    res.status(200).json({
      status: false,
      data: order,
      message: 'Order Created'
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/:id', [verify, parser.none()], async(req, res, next) => {
  let order = null;
  const allow = await utils.checkOrderUserId(req, req.params.id);
  if (allow) {
    order = await OrderProduct.findOne({ where: {id: req.params.id}, include: includes });
    res.status(200).json(order)
  } else {
    res.status(401).json({status: false, message: 'not authorized'})
  }
});

router.get('/:id', [verify, parser.none()], async(req, res, next) => {
  // get orders
  let order = null;

  if (req.user.type !== '1') {
    try {
      order = await OrderProduct.findOne({ where: {id: req.params.id}, include: includes});
      res.status(200).json(order)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      order = await OrderProduct.findOne({ where: {id: req.params.id, userId: req.user.id}, include: includes});
      res.status(200).json(order)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

router.get('/', [verify, parser.none()], async(req, res, next) => {
  // get orders
  let order = null;

  if ((req.query.id || req.query.order) && req.user.type !== '1') {
    let get = null
    if (req.query.id) {
      get = await OrderProduct.findOne({where: {id: req.query.id, userId: req.user.id}, include: includes})
    } else if (req.query.order) {
      get = await OrderProduct.findOne({where: {orderId: req.query.order, userId: req.user.id}, include: includes})
    }
    if (!get) {
      res.status(401).json({status: false, message: 'not authorized'})
    } else {
      res.status(200).json(order)
    }
  }

  if (req.query.id) {
    try {
      order = await OrderProduct.findOne({ where: {id: req.query.id}, include: includes});
      res.status(200).json(order)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else if (req.query.ids) {
    try {
      product = await OrderProduct.findAll({ where: { id: { [Op.in]: req.query.ids}}, include: includes});
      res.status(200).json(product)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else if (req.query.order) {
    try {
      order = await OrderProduct.findAll({ where: {orderId: req.query.order}, include: includes});
      res.status(200).json(order)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      order = await OrderProduct.findAll({ include: includes });
      res.status(200).json(order)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router
