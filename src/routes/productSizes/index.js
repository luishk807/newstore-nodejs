const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const ProductSize = require('../../pg/models/ProductSizes');
const Product = require('../../pg/models/Products');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../../config');
const includes = ['sizeStatus'];

router.all('*', cors());

router.delete('/:id', verify,  (req, res, next) => {
  // delete size
  ProductSize.findAll({ where: {id: req.params.id}})
  .then((size) => {
    ProductSize.destroy({
      where: {
        id: size[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({status: true, message: "size successfully deleted" });
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
    'name': body.name,
    'status': body.status,
  }

  ProductSize.update(
    dataInsert,
    {
      where: {
        id: bid
      }
    }
  ).then((updated) => {
    let message = "Size Updated";
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
  let dataEntry = null;
  const body = req.body;

  dataEntry = {
    'name': body.name,
    'productId': body.productId
  }

  ProductSize.create(dataEntry).then((product) => {
    res.status(200).json(product);
  })
})

router.get('/product/:product', async(req, res, next) => {
  const size = await ProductSize.findAll({ where: {productId: req.params.product}, include: includes});
  res.json(size)
});

router.get('/:id', async(req, res, next) => {
  const size = await ProductSize.findOne({ where: {id: req.params.id}, include: includes});
  res.json(size)
});

router.get('/', async(req, res, next) => {
  // get sizes
  let size = null;
  if (req.query.id) {
    try {
      size = await ProductSize.findOne({ where: {id: req.query.id}, include: includes});
      res.status(200).json(size)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      size = await ProductSize.findAll({include: includes});
      res.status(200).json(size)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router