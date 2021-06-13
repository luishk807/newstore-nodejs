const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const ProductItems = require('../../pg/models/ProductItems');
const ProductItemImages = require('../../pg/models/ProductItemImages');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../../config');
const controller = require('../../controllers/productItems');
const s3 = require('../../services/storage.service');
const includes = ['productItemsStatus','productItemProduct', 'productImages', 'productItemColor', 'productItemSize'];
const imgStorageSvc = require('../../services/imageStorage.service');

router.all('*', cors());

router.delete('/:id', verify, async (req, res, next) => {
  if (req.params.id) {
    const result = await controller.deleteProductItem(req.params.id);
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
  let imagesUploaded = [];
  const uploadResult = await imgStorageSvc.uploadImages(req.files);
  if (uploadResult.error) {
    res.status(500).send(uploadResult.error);
  } else {
    imagesUploaded = uploadResult.images;
  }

  const body = req.body;
  const pid = req.params.id;
  const updated = await ProductItems.update({
    'productColor': +body.productColor,
    'productSize': +body.productSize,
    'stock': body.stock,
    'model': body.model,
    'billingCost': body.billingCost,
    'unitCost': body.unitCost,
    'profitPercentage': body.profitPercentage,
    'flete': body.flete,
    'fleteTotal': body.fleteTotal,
    'finalUnitPrice': body.finalUnitPrice,
    'unitPrice': body.unitPrice,
    'code': body.code,
    'sku': body.sku,
    'exp_date': body.exp_date,
    'retailPrice': body.retailPrice,
    'vendorId': +body.vendor,
    'status': +body.status
  }, { where: { id: pid } });
  
  let message = "Product Item Updated";
  // delete all images first in servers
  const partBodySaved = req.body.saved ? JSON.parse(req.body.saved) : null;
  if (partBodySaved && Object.keys(partBodySaved).length) {
    let mapFiles = []
    let index = []
    Object.keys(partBodySaved).forEach((key) => {
      mapFiles.push(partBodySaved[key].img_url)
      if (partBodySaved[key].img_thumb_url) { // Have to verify if this exists, probably is not part coming from frontend
        mapFiles.push(partBodySaved[key].img_thumb_url)
      }
      index.push(partBodySaved[key].id)
    })
    
    // delete image selected
    try {
      const promises = [];
      mapFiles.forEach(imageKey => {
        promises.push(imgStorageSvc.remove(imageKey))
      })
      await Promise.all(promises);
      // res.status(200).json({ status: true, message: "Product successfully deleted" });
    } catch (e) {
      message += " .Error on deleting image!";
    }

    // delete data from db
    try{
      ProductItemImages.destroy({ where: { id: index }})
    } catch (e) {
      console.log(e)
    }
  }

  let counter = 1;
  // save all data to product images
  if (imagesUploaded && imagesUploaded.length) {
    let newImages = imagesUploaded.map((data) => {
      return {
        'productItemId': pid,
        'img_url': data.image.Key,
        'img_thumb_url': data.thumbnail.Key,
        'position': counter++
      }
    })
    // save entired bulk to product images
    ProductItemImages.bulkCreate(newImages).then((images) => {
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
});

router.post('/', [verify, parser.array('image')], async (req, res, next) => {
  // add / update products
  let imagesUploaded = [];
  const uploadResult = await imgStorageSvc.uploadImages(req.files);
  if (uploadResult.error) {
    res.status(500).send(uploadResult.error);
  } else {
    imagesUploaded = uploadResult.images;
  }

  const body = req.body;

  ProductItems.create({
      'productId': Number(body.productId),
      'productColor': Number(body.productColor),
      'productSize': Number(body.productSize),
      'stock': body.stock,
      'model': body.model,
      'billingCost': body.billingCost,
      'unitCost': body.unitCost,
      'profitPercentage': body.profitPercentage,
      'flete': body.flete,
      'fleteTotal': body.fleteTotal,
      'finalUnitPrice': body.finalUnitPrice,
      'unitPrice': body.unitPrice,
      'code': body.code,
      'sku': body.sku,
      'exp_date': body.exp_date,
      'retailPrice': body.retailPrice,
      'vendorId': Number(body.vendor),
  }).then((productItem) => {
    let counter = 1;
    const newImages = imagesUploaded.map((data) => {
      return {
        'productItemId': productItem.id,
        'img_url': data.image.Key,
        'img_thumb_url': data.thumbnail.Key,
        'position': counter++
      }
    })
    ProductItemImages.bulkCreate(newImages).then(() => {
      res.status(200).json({status: true, message: "Product Items added", data: productItem});
    })
  }).catch(err => {
    res.status(401).json({status: false, message: "Unable to add product items"});
  })
})

router.post('/import', [verify], (req, res, next) => {
  const data = req.body;
  controller.importProducts(data, req.user.id).then((result) => {
    res.status(200).json({status: true, message: "Products imported"});
  }).catch((err) => {
    res.status(500).json(err);
  });
});

router.get('/:id', async(req, res, next) => {
    let product = await controller.getProductItemById(req.params.id);
    res.json(product)
});

router.get('/product/:id', async(req, res, next) => {
  let product = await controller.getProductItemByProductId(req.params.id);
  res.json(product)
});

router.get('/filters/bulk', async(req, res, next) => {
  // get colors
  try {
    const products = await controller.getProductItemByIds(req.query.ids);
    res.status(200).json(products)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/filters/search', async(req, res, next) => {
    try {
      const product = await controller.searchProductItemByName(req.query.search, req.query.page);
      res.json(product);
    } catch(err) {
      res.send(err)
    }
});

router.get('/', async(req, res, next) => {
  // get products
  const limit = 10;
  let product = null;
  if (req.query.id) {
    try {
      product = await controller.getProductItemById(req.query.id);
      res.json(product)
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.ids) {
    try {
      product = await controller.getProductItemByIds(req.query.ids);
      res.status(200).json(product)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else if (req.query.vendor) {
    try {
      product = await ProductItems.findAll({ where: {vendorId: req.query.vendor}, include: includes});

      res.json(product)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      let query = {
        include: includes
      }
      if (req.query.page) {
        const page = req.query.page > 0 ? req.query.page - 1 : 0;
        query = {
          ...query,
          limit: limit,
          offset: page ? page * limit : 0,
        }
      }
      product = await ProductItems.findAll(query);
      res.json(product)
    } catch(err) {
      res.send(err)
    }
  }
});

module.exports = router;
