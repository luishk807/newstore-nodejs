const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
// const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const Product = require('../../pg/models/Products');
const ProductImages = require('../../pg/models/ProductImages');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/products');
const imgStorageSvc = require('../../services/imageStorage.service');

router.all('*', cors());

router.delete('/:id', verify, async (req, res, next) => {
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

router.put('/:id', [verify, parser.array('image')], async (req, res, next) => {
  let quit = false;
  let imagesUploaded = [];
  const uploadResult = await imgStorageSvc.uploadImages(req.files);
  if (uploadResult.error) {
    quit = true;
    res.status(500).send(uploadResult.error);
  } else {
    imagesUploaded = uploadResult.images;
  }

  if (!quit) {
    const body = req.body;
    const pid = req.params.id;
    const updated = await Product.update({
        'name': body.name,
        'stock': body.stock,
        'amount': body.amount,
        'category': body.category,
        'brand': body.brand,
        'model': body.model,
        'sku': body.sku,
        'description': body.description,
        'vendor': body.vendor,
    }, { where: { id: pid } });

    let message = "Product Updated";
    // delete all images first in servers
    const partBodySaved = req.body.saved ? JSON.parse(req.body.saved) : null;
    if (partBodySaved && Object.keys(partBodySaved).length) {
      let mapFiles = []
      let index = []
      Object.keys(partBodySaved).forEach((key) => {
        mapFiles.push(partBodySaved[key].img_url)
        if (partBodySaved[key].img_thumb_url) { // If a thumbnail exists, have to check if it comes from req.body.saved
          mapFiles.push(partBodySaved[key].img_thumb_url)
        }
        index.push(partBodySaved[key].id)
      })
      
      // delete image selected
      try {
        const promises = [];
        mapFiles.forEach(imageKeys => {
          promises.push(imgStorageSvc.remove(imageKeys))
        })
        await Promise.all(promises);
      // res.status(200).json({ status: true, message: "Product successfully deleted" });
      } catch (e) {
        message += " .Error on deleting image!";
      }

      // delete data from db
      try {
        ProductImages.destroy({ where: { id: index }})
      } catch (e) {
        console.log(e)
      }
    }

    let counter = 1;
    // save all data to product images
    if (imagesUploaded && imagesUploaded.length) {
      let newImages = imagesUploaded.map((data) => {
        return {
          'productId': pid,
          'img_url': data.image.Key,
          'img_thumb_url': data.thumbnail.Key,
          'position': counter++
        }
      })

      // save entired bulk to product images
      ProductImages.bulkCreate(newImages).then(() => {
        res.status(200).json({
          status: updated,
          message: message
        });
      })
    } else {
      res.status(200).json({
        status: updated,
        message: message
      });
    }
  }
});

router.post('/', [verify, parser.array('image')], async (req, res, next) => {
  // add / update products
  let quit = false;
  let imgsUploads = [];
  const uploadResult = await imgStorageSvc.uploadImages(req.files);
  if (uploadResult.error) {
    quit = true;
    res.status(500).send(uploadResult.error);
  } else {
    imgsUploads = uploadResult.images;
  }

  if (!quit) { // Prevent the product to be created if image upload fails
    const body = req.body;

    Product.create(
      {
        'name': body.name,
        'stock': body.stock,
        'amount': body.amount,
        'category': body.category,
        'brand': body.brand,
        'model': body.model,
        'sku': body.sku,
        'description': body.description,
        'vendor': body.vendor,
      }
    ).then((product) => {
      let counter = 1;
      const newImages = imgsUploads.map((data) => {
        return {
          'productId': product.id,
          'img_url': data.image.Key,
          'img_thumb_url': data.thumbnail.Key,
          'position': counter++
        }
      })
      ProductImages.bulkCreate(newImages).then((images) => {
        res.status(200).json({status: true, message: "Product added", data: product});
      })
    }).catch(err => {
      res.status(401).json({status: false, message: "Unable to add product"});
    })
  }
})

router.post('/import', [verify], (req, res, next) => {
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
      const product = await controller.searchProductByType('vendorId', req.query.vendor, req.query.page, req.query.fullDetail);
      res.json(product);
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.ids) {
    try {
      const product = await controller.searchProductByIds(req.query.ids, req.query.page);
      res.status(200).json(product)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else if (req.query.search) {
    try {
      const product = await controller.searchProductByName(req.query.search, req.query.page, req.query.fullDetail);
      res.json(product);
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.category) {
    try {
      const product = await controller.searchProductByType('categoryId', req.query.category, req.query.page, req.query.fullDetail);
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
      const product = await controller.searchProductById(req.params.id);
      res.json(product)
    } catch(err) {
      res.send(err)
    }
});

router.get('/',async(req, res, next) => {
  // // get products
  try {
    const product = await controller.getAllProducts(req.query.page, req.query.fullDetail);
    res.json(product)
  } catch(err) {
    res.send(err)
  }
});

module.exports = router;
