const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const parser = require('../../middlewares/multerParser');
const SubCategory = require('../../pg/models/SubCategories');

const includes = ['subCategoriesCategory'];

router.all('*', cors());

router.delete('/:id', verify, (req, res, next) => {
  // delete brands
  SubCategory.findAll({ where: {id: req.params.id}})
  .then((brand) => {
    SubCategory.destroy({
      where: {
        id: brand[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({ status: deletedRecord, message: "Sub category successfully deleted" });
    }, (err) => {
      res.status(500).json({status: false, message: err});
    })
  })
});

router.put('/:id', [verify, parser.none()], (req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  
  SubCategory.update(
    {
      'name': body.name,
      'categoryId': body.categoryId,
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
      message: 'Sub Category Updated'
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [verify, parser.none()], (req, res, next) => {
  const body = req.body;

  SubCategory.create({
    'name': body.name,
    'categoryId': body.categoryId,
    'icon': body.icon
  }).then((product) => {
    res.status(200).json(product);
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/:id', async(req, res, next) => {
    const subcategory = await SubCategory.findAll({ where: {id: req.params.id}, include: includes});
    res.json(subcategory)
});

router.get('/', async(req, res, next) => {
  // get products
  let subcategory = null;
  if (req.query.id) {
    try {
      subcategory = await SubCategory.findOne({ where: {id: req.query.id}, include: includes});
      res.status(200).json(subcategory)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      subcategory = await SubCategory.findAll();
      res.status(200).json(subcategory)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router
