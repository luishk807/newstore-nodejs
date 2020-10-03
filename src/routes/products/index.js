const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const data = require('../../samples/products.json');

const ProductImagesModel = require('../../pg/models/ProductImages');
const Model = require('../../pg/models/Products');

const ProductImages = ProductImagesModel.getModel();
const Product = Model.getModel();

Product.hasMany(ProductImages, { as: "product_images" });
ProductImages.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
  onDelete: 'CASCADE',
});

router.all('*', cors());

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/products')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +file.originalname )
  }
})

var upload = multer({ storage: storage }).array('image')

router.delete('/products/:id', (req, res, next) => {
  // delete products
  Product.findAll({ where: {id: req.params.id},include:['product_images']})
  .then((product) => {
    const mapFiles = product[0].product_images.map(data => {
      return './public/images/products/'+data.img_url;
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
            console.log('deletiung',data)
            // if (fs.existsSync(data)) {
              fs.unlinkSync(data);
            //}
          })
          res.status(200).json({ message: "Product successfully deleted" });
        } catch (e) {
          res.status(400).json({ message: "Product delete, but error on deleting image!", error: e.toString(), req: req.body });
        }
      }
    }, (err) => {
        res.json(err);
    })
  })
});

router.put('/products/:id', (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
      return res.status(500).json(err)
    }
    const body = req.body;
    const pid = req.params.id;

    Product.find({ where: { id: pid } })
    .on('success', function (product) {
      // Check if record exists in db
      if (product) {
        product.update({
          'name': body.name,
          'stock': body.stock,
          'amount': body.amount,
          'category': body.category,
          'brand': body.brand,
          'model': body.model,
          'code': body.code,
          'description': body.description,
          'vendor': body.vendor,
        })
        .success(function (new_product) {
          let counter = 1;
          const newImages = req.files.map((data) => {
            return {
              'productId': new_product.id,
              'img_url': data.filename,
              'position': counter++
            }
          })
          ProductImages.bulkCreate(newImages).then((images) => {
            res.status(200).json(new_product);
          })
        })
      }
    })
  })
});

router.post('/products', (req, res, next) => {
  // add / update products
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
    } else if (err) {
        return res.status(500).json(err)
    }
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
      const newImages = req.files.map((data) => {
        return {
          'productId': product.id,
          'img_url': data.filename,
          'position': counter++
        }
      })
      ProductImages.bulkCreate(newImages).then((images) => {
        res.status(200).json(product);
      })
    })
  })
});

router.get('/products/:id', async(req, res, next) => {
    let product = await Product.findAll({ where: {id: req.params.id}});
    res.json(product)
});

router.get('/products', async(req, res, next) => {
  // get products
  let product = null;
  if (req.query.id) {
    try {
      product = await Product.findAll({ where: {id: req.query.id},include:['product_images']});
      res.json(product)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      product = await Product.findAll();
      res.json(product)
    } catch(err) {
      res.send(err)
    }
  }
});

module.exports = router