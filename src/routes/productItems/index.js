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
const { Op } = require('sequelize');
const includes = ['productItemsStatus','productItemProduct', 'productImages', 'productItemColor', 'productItemSize'];

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


router.put('/:id', [verify, parser.array('image')], (req, res, next) => {
  const imagesUploaded = req.files.map((file) => {
    let myFile = file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid.v4()}.${fileType}`;
    const params = {
      Bucket: config.s3.bucketName,
      Key: fileName,
      Body: file.buffer,
    }

    s3.upload(params, (err, data) => {
      if (err) {
        res.status(500).send({status: false, message: err})
      }
    })

    return {
      Key: fileName
    };
  })

  const body = req.body;
  const pid = req.params.id;

  ProductItems.update(
    {
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
      'exp_date': body.exp_date,
      'retailPrice': body.retailPrice,
      'vendorId': Number(body.vendor),
    },{
      where: {
        id: pid
      }
    }
  ).then((updated) => {
    let message = "Product Item Updated";
    // delete all images first in servers
    const partBodySaved = req.body.saved ? JSON.parse(req.body.saved) : null;
    if (partBodySaved && Object.keys(partBodySaved).length) {
      let mapFiles = []
      let index = []
      Object.keys(partBodySaved).forEach((key) => {
        mapFiles.push(partBodySaved[key].img_url)
        index.push(partBodySaved[key].id)
      })
      
      // delete image selected
      try {
        mapFiles.forEach(data => {
          const params = {
            Bucket: config.s3.bucketName,
            Key: data,
          }
          s3.deleteObject(params, (err, data) => {
            if (err) {
              res.status(500).send({status: false, message: err})
            }
          })
        })
       // res.status(200).json({ status: true, message: "Product successfully deleted" });
      } catch (e) {
        message += " .Error on deleting image!";
      }


      // delete data from db
      try{
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
          'productItemId': pid,
          'img_url': data.Key,
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
  })
});

router.post('/', [verify, parser.array('image')], (req, res, next) => {
  // add / update products
  const imagesUploaded = req.files.map((file) => {
    let myFile = file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid.v4()}.${fileType}`;
    const params = {
      Bucket: config.s3.bucketName,
      Key: fileName,
      Body: file.buffer,
    }

    s3.upload(params, (err, data) => {
      if (err) {
        res.status(500).send(err)
      }
    })

    return {
      Key: fileName
    };
  })

  const body = req.body;

  ProductItems.create(
    {
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
      'exp_date': body.exp_date,
      'retailPrice': body.retailPrice,
      'vendorId': Number(body.vendor),
    }
  ).then((ProductItems) => {
    let counter = 1;
    const newImages = imagesUploaded.map((data) => {
      return {
        'productItemId': ProductItems.id,
        'img_url': data.Key,
        'position': counter++
      }
    })
    ProductItemImages.bulkCreate(newImages).then((images) => {
      res.status(200).json({status: true, message: "Product Items added", data: ProductItems});
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
    let product = await ProductItems.findOne({ where: {id: req.params.id}, include: includes });
    res.json(product)
});

router.get('/product/:id', async(req, res, next) => {
  let product = await ProductItems.findAll({ where: {productId: req.params.id}, include: includes});
  res.json(product)
});

router.get('/', async(req, res, next) => {
  // get products
  const limit = 10;
  let product = null;
  if (req.query.id) {
    try {
      product = await ProductItems.findOne({ where: {id: req.query.id}, include: includes});

      res.json(product)
    } catch(err) {
      res.send(err)
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
