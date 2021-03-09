const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const ProductBundle = require('../../pg/models/ProductBundles');
const parser = require('../../middlewares/multerParser');
const service = require('../../services/productBundle.service');
const uuid = require('uuid');
const config = require('../../config');
const includes = ['productBundleStatus'];

router.all('*', cors());

router.delete('/:id', verify,  (req, res, next) => {
  // delete color
  ProductBundle.findAll({ where: {id: req.params.id}})
  .then((color) => {
    ProductBundle.destroy({
      where: {
        id: color[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({status: true, message: "Bundle successfully deleted" });
    }, (err) => {
      res.status(500).json({status: false, message: err});
    })
  })
});


router.put('/:id', [verify, parser.none()], (req, res, next) => {
  let dataInsert = null;
  const body = req.body;
  const bid = req.params.id;

  dataInsert = {
    'productItem': body.productItem,
    'stock': body.stock,
    'retailPrice': body.retailPrice,
    'name': body.name,
    'status': body.status,
  }

  ProductBundle.update(
    dataInsert,
    {
      where: {
        id: bid
      }
    }
  ).then((updated) => {
    let message = "Bundle Updated";
    // delete all images first in servers
    res.status(200).json({
      status: true,
      data: updated,
      message: message
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [verify, parser.none()], (req, res, next) => {
  service.createProductColor(req.body)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error creating product bundle', error: err});
    });
})

router.get('/product/:product', async(req, res, next) => {
  const bundle = await ProductBundle.findAll({ where: {productId: req.params.product}, include: includes});
  res.json(bundle)
});

router.get('/:id', async(req, res, next) => {
  service.getProductColorById(req.params.id)
    .then(bundle => {
      res.status(200).json(bundle);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error getting product bundle', error: err })
    })
});

router.get('/', async(req, res, next) => {
  // get bundle
  let bundle = null;
  if (req.query.id) { // Do we need this (/?id=1) also?  We already have the top one /:id. This is duplicated functionality
    try {
      bundle = await ProductBundle.findOne({ where: {id: req.query.id}, include: includes});
      res.status(200).json(bundle)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      bundle = await ProductBundle.findAll({include: includes});
      res.status(200).json(bundle)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router