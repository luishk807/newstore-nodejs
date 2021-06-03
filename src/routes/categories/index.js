const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const parser = require('../../middlewares/multerParser');
const Category = require('../../pg/models/Categories');

router.all('*', cors());

router.delete('/:id', verify, (req, res, next) => {
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

router.put('/:id', [verify, parser.none()], (req, res, next) => {
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
      status: true,
      data: updated,
      message: 'Category Updated'
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [verify, parser.none()], (req, res, next) => {
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

router.get('/:id', async(req, res, next) => {
    const category = await Category.findOne({ where: {id: req.params.id}});
    res.json(category)
});

router.get('/', async(req, res, next) => {
  // get products
  let category = null;
  if (req.query.id) {
    try {
      category = await Category.findOne({ where: {id: req.query.id}});
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
