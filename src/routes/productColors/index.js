const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const ProductColor = require('../../pg/models/ProductColors');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/productColors');
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
  controller.createProductColor(req.body)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error creating product color', error: err});
    });
})

router.get('/product/:product', async(req, res, next) => {
  const color = await controller.getProductColorByProductId(req.params.product);
  res.json(color)
});

router.get('/:id', async(req, res, next) => {
  try {
    const color = await controller.getProductColorById(req.params.id);
    res.status(200).json(color)
  } catch(err) {
    res.status(500).json({ message: 'Error getting product color', error: err })
  }
});

router.get('/filters/bulk', async(req, res, next) => {
  // get colors
  try {
    const color = await controller.getProductColorByIds(req.query.ids);
    res.status(200).json(color)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/', async(req, res, next) => {
  // get colors
  try {
    const color = await controller.getProductColors();
    res.status(200).json(color)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

module.exports = router