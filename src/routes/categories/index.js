const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const verify = require('../verifyToken');

const Model = require('../../pg/models/Categories');
const ProductModel = require('../../pg/models/Products');

const Category = Model.getModel();
const Product = ProductModel.getModel();

router.all('*', cors());

var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})

Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "categories",
  onDelete: 'SET NULL',
});

var upload = multer({ storage: storage }).single('image')

router.delete('/categories/:id', verify, (req, res, next) => {
  // delete brands
  Category.findAll({ where: {id: req.params.id}})
  .then((brand) => {
    Category.destroy({
      where: {
        id: brand[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({ status: deletedRecord, message: "Category successfully deleted" });
    }, (err) => {
      res.status(500).json({status: false, message: err});
    })
  })
});

router.put('/categories/:id', [verify, upload], (req, res, next) => {
  let dataInsert = null;
  const body = req.body;
  const bid = req.params.id;
  
  Category.update(
    {
      'name': body.name,
      'status': body.status,
      'icon': body.icon,
    },
    {
      where: {
        id: bid
      }
    }
  ).then((updated) => {
    res.status(200).json({
      data: updated,
      message: 'Category Updated'
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/categories', verify, upload, (req, res, next) => {
  let dataEntry = null;
  const body = req.body;

  Category.create({
    'name': body.name,
    'icon': body.icon
  }).then((product) => {
    res.status(200).json(product);
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/categories/:id', async(req, res, next) => {
    let category = await Category.findAll({ where: {id: req.params.id}});
    res.json(category)
});

router.get('/categories', async(req, res, next) => {
  // get products
  let category = null;
  if (req.query.id) {
    try {
      category = await Category.findAll({ where: {id: req.query.id}});
      res.status(200).json(category)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      category = await Category.findAll();
      res.status(200).json(category)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router