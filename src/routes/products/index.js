const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const Product = require('../../pg/models/Products');
const ProductImages = require('../../pg/models/ProductImages');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../../config');
const controller = require('../../controllers/products');
const s3 = require('../../services/storage.service');
const { Op } = require('sequelize');
const includes = ['productBrand', 'productStatus', 'productImages', 'productSizes', 'productColors', 'productProductItems'];

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

router.get('/:id', async(req, res, next) => {
    let product = await Product.findAll({ where: {id: req.params.id}});
    res.json(product)
});

router.get('/admin/home', async(req, res, next) => {
  try {
    let query = {
      include:['productBrand','categories','productStatus', 'productSizes', 'productColors', 'productProductItems']
    }
    if (req.query.page) {
      const page = req.query.page > 0 ? req.query.page - 1 : 0;
      query = {
        ...query,
        limit: limit,
        offset: page ? page * limit : 0,
      }
    }
    product = await Product.findAll(query);
    res.json(product)
  } catch(err) {
    res.send(err)
  }
});

const paginate = ({ page, pageSize }) => {
  const offset = page * pageSize;
  const limit = pageSize;

  return {
    offset,
    limit,
  };
};

router.get('/', async(req, res, next) => {
  // get products
  const limit = 10;
  let product = null;
  if (req.query.id) {
    try {
      product = await Product.findOne({ where: {id: req.query.id}, include: includes});

      res.json(product)
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.vendor) {
    try {
      product = await Product.findAll({ where: {vendorId: req.query.vendor}, include: includes});

      res.json(product)
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.ids) {
    try {
      product = await Product.findAll({ where: { id: { [Op.in]: req.query.ids}}, include: includes});
      res.status(200).json(product)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else if (req.query.search) {
    try {
      if (req.query.page) {
        const page = req.query.page > 0 ? req.query.page - 1 : 0;
        const offset = page ? page * limit : 0;
        Product.findAndCountAll({ 
          where: {
            name: {
              [Op.iLike]: `%${req.query.search}%`
            }
          }
        }).then((countResult) => {
          Product.findAll({
            where: {
              name: {
                [Op.iLike]: `%${req.query.search}%`
              }
            },
            include: includes,
            offset: offset,
            limit: limit
          }).then((result) => {
            const pages = Math.ceil(countResult.count / limit)
            const results = {
              count: countResult.count,
              items: result,
              pages: pages
            }
            res.json(results);
          }).catch((err) => {
            res.send(err)
          })
        }).catch((err) => {
          res.send(err)
        })
      } else {
        product = await Product.findAll({ where: {
          name: {
            [Op.iLike]: `%${req.query.search}%`
          }
        }, include: includes});
        res.json(product);
      }
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.category) {
    try {
      if (req.query.page) {
        const page = req.query.page > 0 ? req.query.page - 1 : 0;
        const offset = page ? page * limit : 0;
        Product.findAndCountAll({ 
          where: {categoryId: req.query.category}
        }).then(countResult => {
          Product.findAll({ 
            where: {categoryId: req.query.category}, 
            include: includes,
            limit: limit,
            offset: offset,
          }).then(result => {
            const pages = Math.ceil(countResult.count / limit)
            const results = {
              count: countResult.count,
              items: result,
              pages: pages
            }
            res.json(results);
          }).catch((err) => {
            res.send(err)
          });
        }).catch((err) => {
          res.send(err)
        })
      } else {
        product = await Product.findAll({ where: {categoryId: req.query.category}, include: includes});
        res.json(product)
      }
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      let query = {
        include:['productImages','productVendor', 'productBrand','categories','productStatus', 'rates', 'productSizes', 'productColors']
      }
      if (req.query.page) {
        const page = req.query.page > 0 ? req.query.page - 1 : 0;
        query = {
          ...query,
          limit: limit,
          offset: page ? page * limit : 0,
        }
      }
      product = await Product.findAll(query);
      res.json(product)
    } catch(err) {
      res.send(err)
    }
  }
});

module.exports = router;
