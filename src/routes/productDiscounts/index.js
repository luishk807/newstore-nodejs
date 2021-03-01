const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const ProductDiscount = require('../../pg/models/ProductDiscounts');
const parser = require('../../middlewares/multerParser');
const utils = require('../../controllers/orders');
const { Op } = require('sequelize');

const includes = ['productDiscountProduct'];

router.all('*', cors());

router.delete('/:id', verifyAdmin, (req, res, next) => {
  // delete brands
  ProductDiscount.findOne({ where: {id: req.params.id}})
  .then((comment) => {
    ProductDiscount.destroy({
      where: {
        id: req.params.id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        res.status(200).json({ status: true, message: "Discount successfully deleted" });
      } else {
        res.status(400).json({ status: false, message: "Error on deleting discount!", error: e.toString(), req: req.body });
      }
    }, (err) => {
        res.status(500).json({status: false, message: err});
    })
  })
});

router.put('/:id', [verifyAdmin, parser.none()], (req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  ProductDiscount.update(
    {
      'productId': body.productId,
      'price': body.price,
      'name': body.name,
      'startDate': body.startDate,
      'endDate': body.endDate,
      'minQuantity': body.minQuantity,
      'percentage': body.percentage,
    },
    {
      where: {
        id: id
      }
    }
  ).then((updated) => {
    res.status(200).json({
      status: true,
      data: updated,
      message: "Discount Updated"
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [verifyAdmin, parser.none()], (req, res, next) => {
  const body = req.body;
  ProductDiscount.create({
    'productId': body.productId,
    'price': body.price,
    'name': body.name,
    'startDate': body.startDate,
    'endDate': body.endDate,
    'minQuantity': body.minQuantity,
    'percentage': body.percentage,
  }).then((data) => {
    res.status(200).json({status: true, data: data});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.get('/:id', [verifyAdmin, parser.none()], async(req, res, next) => {
  const product = await ProductDiscount.findOne({ where: {id: req.params.id}, include: includes });
  res.json(product)
});

router.get('/product/:id', [verifyAdmin, parser.none()], async(req, res, next) => {
  const product = await ProductDiscount.findAll({ where: {productId: req.params.id}, include: includes });
  res.json(product)
});


router.get('/', [verifyAdmin, parser.none()], async(req, res, next) => {
  let discount = null;
  if (req.query.id) {
    try {
      discount = await ProductDiscount.findOne({ where: {id: req.query.id}, include: includes});
      res.status(200).json(discount)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }  else if (req.query.ids) {
    try {
      discount = await ProductDiscount.findAll({ where: { id: { [Op.in]: req.query.ids}}, include: includes});
      res.status(200).json(discount)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      discount = await ProductDiscount.findAll({include: includes});
      res.status(200).json(discount)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router
