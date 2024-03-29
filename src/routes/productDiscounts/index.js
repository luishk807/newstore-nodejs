const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const ProductDiscount = require('../../pg/models/ProductDiscounts');
const controller = require('../../controllers/productDiscounts');
const parser = require('../../middlewares/multerParser');
const utils = require('../../controllers/orders');
const { Op } = require('sequelize');
const { createProductDiscount, updateProductDiscount } = require('../../services/productDiscount.service');

const includes = ['productDiscountProduct'];
const { checkCorsOrigins } = require('../../utils/server');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));


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
  updateProductDiscount(req).then((data) => {
    res.status(200).json({
      status: true,
      data: data,
      message: "Discount Updated"
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [verifyAdmin, parser.none()], (req, res, next) => {
  const body = req.body;
  createProductDiscount(body).then((data) => {
    res.status(200).json({status: true, data: data});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.get('/:id', [verifyAdmin, parser.none()], async(req, res, next) => {
  const product = await controller.getProductDiscountById(req.params.id);
  res.json(product)
});

router.get('/product/:id', [verifyAdmin, parser.none()], async(req, res, next) => {
  const product = await controller.getProductDiscountByProductId(req.params.id);
  res.json(product)
});

router.get('/filters/bulk', async(req, res, next) => {
  // get discounts
  try {
    const discount = await controller.getProductDiscountByIds(req.query.ids);
    res.status(200).json(discount)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/', [verifyAdmin, parser.none()], async(req, res, next) => {
  let discount = null;
  if (req.query.id) {
    try {
      discount = await controller.getProductDiscountById(req.query.id);
      res.status(200).json(discount)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else if (req.query.ids) {
    try {
      discount = await controller.getProductDiscountByIds(req.query.ids);
      res.status(200).json(discount)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      discount = await controller.getProductDiscounts();
      res.status(200).json(discount)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router
