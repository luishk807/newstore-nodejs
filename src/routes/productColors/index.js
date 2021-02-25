const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const ProductColor = require('../../pg/models/ProductColors');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../../config');
const includes = ['colorStatus'];

router.all('*', cors());

router.delete('/:id', verify,  (req, res, next) => {
  // delete color
  ProductColor.findAll({ where: {id: req.params.id}})
  .then((color) => {
    ProductColor.destroy({
      where: {
        id: color[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({status: true, message: "Color successfully deleted" });
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
    'color': body.color,
    'name': body.name,
    'status': body.status,
  }

  ProductColor.update(
    dataInsert,
    {
      where: {
        id: bid
      }
    }
  ).then((updated) => {
    let message = "Color Updated";
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
    'color': body.color,
    'name': body.name,
    'productId': body.productId
  }

  ProductColor.create(dataEntry).then((product) => {
    res.status(200).json(product);
  })
})

router.get('/product/:product', async(req, res, next) => {
  const color = await ProductColor.findAll({ where: {productId: req.params.product}, include: includes});
  res.json(color)
});

router.get('/:id', async(req, res, next) => {
  const color = await ProductColor.findOne({ where: {id: req.params.id}, include: includes});
  res.json(color)
});

router.get('/', async(req, res, next) => {
  // get colors
  let color = null;
  if (req.query.id) {
    try {
      color = await ProductColor.findOne({ where: {id: req.query.id}, include: includes});
      res.status(200).json(color)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      color = await ProductColor.findAll({include: includes});
      res.status(200).json(color)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router