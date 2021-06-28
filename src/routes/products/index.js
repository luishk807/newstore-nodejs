const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/products');
const { checkCorsOrigins } = require('../../utils/server');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));

router.delete('/:id', verifyAdmin, async (req, res, next) => {
  if (req.params.id) {
    const result = await controller.deleteProduct(req.params.id);
    if (result.status) {
      res.status(200).send(result);
    } else {
      if (result.notFound) {
        res.status(404).send(result);
      }
      res.status(500).send(result);
    }
  }
});

router.put('/:id', [verifyAdmin, parser.array('image')], async (req, res, next) => {
  try {
    const product = await controller.updateProduct(req);
    if (product) {
      res.status(200).json({status: true, message: "Product updated", data: product});
    } else {
      res.status(400).json({status: false, message: "Unable to update product", data: product});
    }
  } catch(err) {
    res.send(err)
  }
});

router.post('/', [verifyAdmin, parser.array('image')], async (req, res, next) => {
  try {
    const product = await controller.createManualProduct(req);
    if (product) {
      res.status(200).json({status: true, message: "Product added", data: product});
    } else {
      res.status(400).json({status: false, message: "Unable to add product", data: product});
    }
  } catch(err) {
    res.send(err)
  }
})

router.post('/import', [verifyAdmin], (req, res, next) => {
  const data = req.body;
  controller.importProducts(data, req.user.id).then((result) => {
    res.status(200).json({status: true, message: "Products imported"});
  }).catch((err) => {
    res.status(500).json(err);
  });
});

router.get('/search', async(req, res, next) => {
  if (req.query.vendor) {
    try {
      const product = await controller.searchProductByType('vendorId', req.query.vendor, req.query.page, req.query.isFullDetail);
      res.json(product);
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.ids) {
    try {
      const product = await controller.searchProductByIds(req.query.ids, req.query.page, req.query.isFullDetail);
      res.status(200).json(product)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else if (req.query.search) {
    try {
      const product = await controller.searchProductByName(req.query.search, req.query.page, req.query.isFullDetail);
      res.json(product);
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.category) {
    try {
      const product = await controller.searchProductByType('categoryId', req.query.category, req.query.page, req.query.isFullDetail);
      res.status(200).json(product);
    } catch(err) {
      res.send(err)
    }
  }
});

router.get('/vendor/:id', async(req, res, next) => {
  try {
    const product = await controller.searchProductByType('vendorId', req.params.id, req.query.page);
    res.json(product);
  } catch(err) {
    res.send(err)
  }
});

router.get('/bulk', async(req, res, next) => {
  try {
    const product = await controller.searchProductByIds(req.query.ids, req.query.page, req.query.fullDetail);
    res.status(200).json(product)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/bulk/k', async(req, res, next) => {
  try {
    const product = await controller.searchProductBySlugs(req.query.ids, req.query.page, req.query.fullDetail);
    res.status(200).json(product)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/cat/:id', async(req, res, next) => {
  try {
    const product = await controller.searchProductByType('categoryId', req.params.id, req.query.page, req.query.fullDetail);
    res.json(product);
  } catch(err) {
    res.send(err)
  }
});

router.get('/:id', async(req, res, next) => {
    try {
      const product = await controller.searchProductById(req.params.id, req.query.isFullDetail);
      res.json(product)
    } catch(err) {
      res.send(err)
    }
});

router.get('/full-detail/:id', verifyAdmin, async(req, res, next) => {
  try {
    const product = await controller.searchProductByIdFullDetail(req.params.id);
    res.json(product)
  } catch(err) {
    res.send(err)
  }
});

router.get('/k/:id', async(req, res, next) => {
  try {
    const product = await controller.searchProductBySlug(req.params.id, req.query.isFullDetail);
    res.json(product)
  } catch(err) {
    res.send(err)
  }
});

router.get('/', async(req, res, next) => {
  // get products
  try {
    const product = await controller.getAllProducts(req.query);
    res.json(product)
  } catch(err) {
    res.send(err)
  }
});

module.exports = router;
