const router = require('express').Router();
const cors = require('cors');
const config = require('../../config.js');
const data = require('../../samples/products.json');

const ProductImagesModel = require('../../pg/models/ProductImages');
const Model = require('../../pg/models/Products');

const ProductImages = ProductImagesModel.getModel();
const Product = Model.getModel();

router.all('*', cors());

router.delete('/products', (req, res, next) => {
  // delete products
  Product.destroy({
    where: {
      id: '1'
    }
  }).then((deleteRecord) => {
    if (deleteRecord) {
      res.json({ data: 'deleted'});
    }
  }, (err) => {
      res.json(err);
  })
});

router.post('/products', (req, res, next) => {
  // add / update products
    const body = req.query;
    const images = body.image;
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
      'image[]': body.image,
    }
  ).then((product) => {
    let counter = 1;
    const newImages = images.map((image) => {
      return {
        'product_id': product.id,
        'img_url': image,
        'position': counter++
      }
    })
    ProductImages.bulkCreate(newImages).then((images) => {
      res.status(200).json(product);
    })
  })
});

router.get('/products/:id', async(req, res, next) => {
    product = await Product.findAll({ where: {id: req.params.id}});
    res.json(product)
});

router.get('/products', async(req, res, next) => {
  // get products
  let product = null;
  product = await Product.findAll();

  res.json(product)
});

module.exports = router