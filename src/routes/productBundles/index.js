const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/productBundles');

router.all('*', cors());

router.delete('/:id', verify,  async(req, res, next) => {
  // delete color
  try {
    await controller.deleteProductBundleById(req.params.id);
    res.status(200).json({ status: true, message: "Delivery option successfully deleted" });
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});


router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  try {
    const resp = await controller.saveProductBundle(req);
    if (resp) {
      res.status(200).json({ status: true, data: resp, message: "Bundle Updated" });
    } else {
      res.status(400).json({ status: false, data: resp, message: "Unable to save bundle" });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  try {
    const bundle = await controller.createProductBundle(req.body);
    res.status(200).json({ status: true, data: bundle, message: "Bundle created" })
  } catch(err) {
    res.status(500).json({ message: 'Error creating product bundle', error: err })
  }
})

router.get('/product-item/:id', async(req, res, next) => {
  try {
    const product = await controller.getProductBundleByProductItemId(req.params.id);
    res.json(product)
  } catch(err) {
    res.send(err)
  }
});

router.get('/product-item/active/:id', async(req, res, next) => {
  try {
    const product = await controller.getActiveProductBundleByProductItemId(req.params.id);
    res.json(product)
  } catch(err) {
    res.send(err)
  }
});

router.get('/filters/bulk', async(req, res, next) => {
  // get bulk
  try {
    const products = await controller.getProductBundleByIds(req.query.ids, req.params.page);
    res.status(200).json(products)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/:id', async(req, res, next) => {
    try {
      const product = await controller.getProductBundleById(req.params.id)
      res.json(product)
    } catch(err) {
      res.send(err)
    }
});

router.get('/', async(req, res, next) => {
  // get bundle
  let bundle = null;
  if (req.query.id) {
    try {
      bundle = await controller.getProductBundleById(req.query.id)
      res.status(200).json(bundle)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      bundle = await controller.geAllProductBundles();
      res.status(200).json(bundle)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router