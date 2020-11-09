const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const data = require('../../samples/products.json');
const verify = require('../verifyToken');

const Product = require('../../pg/models/Products');
const ProductImages = require('../../pg/models/ProductImages');

const AWS = require('aws-sdk');
const uuid = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
})

router.all('*', cors());

var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})

var upload = multer({ storage: storage }).array('image')

router.delete('/products/:id', verify, (req, res, next) => {
  // delete products
  Product.findAll({ where: {id: req.params.id},include:['productImages','productVendor', 'productBrand', 'categories', 'productStatus', 'rates']})
  .then((product) => {
    const mapFiles = product[0].productImages.map(data => {
      return data.img_url;
    })
    Product.destroy({
      where: {
        id: product[0].id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        // console.log(deletedRecord, mapFiles)
        try {
          mapFiles.forEach(data => {
            console.log(data)
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: data,
            }
            s3.deleteObject(params, (err, data) => {
              if (err) {
                res.status(500).send({status: false, message: err})
              }
            })
          })
          res.status(200).json({ status: true, message: "Product successfully deleted" });
        } catch (e) {
          res.status(400).json({ status: false, message: "Product delete, but error on deleting image!", error: e.toString(), req: req.body });
        }
      }
    }, (err) => {
        res.json(err);
    })
  })
});


router.put('/products/:id', [verify, upload], (req, res, next) => {


  const imagesUploaded = req.files.map((file) => {
    let myFile = file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid.v4()}.${fileType}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
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
      'code': body.code,
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
    const partBodySaved = JSON.parse(req.body.saved);
    if (partBodySaved && Object.keys(partBodySaved).length) {
      let mapFiles = []
      let index = []
      Object.keys(partBodySaved).forEach((key) => {
        mapFiles.push(partBodySaved[key].img_url)
        index.push(partBodySaved[key])
      })
      
      // delete image selected
      try {
        mapFiles.forEach(data => {
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
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
        ProductImages.destroy({ where: index })
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

router.post('/products', [verify, upload], (req, res, next) => {
  // add / update products

  const imagesUploaded = req.files.map((file) => {
    let myFile = file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid.v4()}.${fileType}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
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
      'code': body.code,
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

router.get('/products/:id', async(req, res, next) => {
    let product = await Product.findAll({ where: {id: req.params.id}});
    res.json(product)
});

router.get('/products', async(req, res, next) => {
  // get products
  let product = null;
  if (req.query.id) {
    try {
      product = await Product.findOne({ where: {id: req.query.id}, include: ['productStatus', 'productImages']});

      res.json(product)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      product = await Product.findAll({include:['productImages','productVendor', 'productBrand','categories','productStatus', 'rates']});
      res.json(product)
    } catch(err) {
      res.send(err)
    }
  }
});

router.get('/productsvendor', [verify], async(req, res, next) => {
  // get products
  let product = null;
  if (req.query.id) {
    try {
      product = await Product.findAll({ where: {vendor: req.query.id}, include: ['productStatus', 'productImages', 'productVendor']});

      res.json(product)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
      res.send({status: false, message: "ERROR: invalid vendor"});
  }
});

router.post('/productsvendor', [verify, upload], (req, res, next) => {
  // add / update products

  const imagesUploaded = req.files.map((file) => {
    let myFile = file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid.v4()}.${fileType}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
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
      'code': body.code,
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

router.delete('/productsvendor/:id', verify, (req, res, next) => {
  // delete products
  Product.findAll({ where: {id: req.params.id},include:['productImages','productVendor', 'productBrand', 'categories', 'productStatus', 'rates']})
  .then((product) => {
    const mapFiles = product[0].productImages.map(data => {
      return data.img_url;
    })
    Product.destroy({
      where: {
        id: product[0].id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        // console.log(deletedRecord, mapFiles)
        try {
          mapFiles.forEach(data => {
            console.log(data)
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: data,
            }
            s3.deleteObject(params, (err, data) => {
              if (err) {
                res.status(500).send({status: false, message: err})
              }
            })
          })
          res.status(200).json({ status: true, message: "Product successfully deleted" });
        } catch (e) {
          res.status(400).json({ status: false, message: "Product delete, but error on deleting image!", error: e.toString(), req: req.body });
        }
      }
    }, (err) => {
        res.json(err);
    })
  })
});


module.exports = router