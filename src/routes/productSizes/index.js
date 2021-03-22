const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const ProductSize = require('../../pg/models/ProductSizes');
// const service = require('../../services/productSize.service');
const controller = require('../../controllers/productSizes');
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
  controller.createProductSize(req.body)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error creating product size', error: err });
    })
})

router.get('/product/:product', async(req, res, next) => {
  const size = await controller.getProductSizeByProductId(req.params.product); 
  res.json(size)
});

router.get('/filters/bulk', async(req, res, next) => {
  // get sizes
  try {
    const size = await controller.getProductSizeByIds(req.query.ids);
    res.status(200).json(size)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/:id', async(req, res, next) => {
  const size = await controller.getProductSizeById(req.params.id);
  res.json(size)
});

router.get('/', async(req, res, next) => {
  // get sizes
  try {
    const size = await controller.getProductSizes();
    res.status(200).json(size)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

module.exports = router