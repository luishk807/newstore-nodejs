const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
// const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const Product = require('../../pg/models/Products');
const ProductImages = require('../../pg/models/ProductImages');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const { paginate } = require('../../utils');
const config = require('../../config');
const controller = require('../../controllers/products');
const s3 = require('../../services/storage.service');
const { Op } = require('sequelize');

const includes = ['productProductDiscount','productBrand', 'productStatus', 'productImages', 'productSizes', 'productColors', 'productProductItems', 'categories', 'subCategoryProduct'];

const limit = config.defaultLimit;

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
  Product.update(
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
    },{
      where: {
        id: pid
      }
    }
  ).then((updated) => {
    let message = "Product Updated";
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
          'productId': pid,
          'img_url': data.Key,
          'position': counter++
        }
      })

      // save entired bulk to product images
      ProductImages.bulkCreate(newImages).then((images) => {
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
    const newImages = imagesUploaded.map((data) => {
      return {
        'productId': product.id,
        'img_url': data.Key,
        'position': counter++
      }
    })
    ProductImages.bulkCreate(newImages).then((images) => {
      res.status(200).json({status: true, message: "Product added", data: product});
    })
  }).catch(err => {
    res.status(401).json({status: false, message: "Unable to add product"});
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

router.get('/search', async(req, res, next) => {
  if (req.query.vendor) {
    try {
      const product = await controller.searchProductByType('vendorId', req.query.vendor, req.query.page);
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
      const product = await controller.searchProductByName(req.query.search, req.query.page);
      res.json(product);
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.category) {
    try {
      const product = await controller.searchProductByType('categoryId', req.query.category, req.query.page);
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
    const product = await controller.searchProductByIds(req.query.ids, req.query.page);
    res.status(200).json(product)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/cat/:id', async(req, res, next) => {
  try {
    const product = await controller.searchProductByType('categoryId', req.params.id, req.query.page);
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
    const product = await controller.getAllProducts(req.query.page);
    res.json(product)
  } catch(err) {
    res.send(err)
  }
});

module.exports = router;
