const router = require('express').Router();
const cors = require('cors');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/categories');

router.all('*', cors());

router.delete('/:id', verifyAdmin, async(req, res, next) => {
  // delete item
  try {
    const resp = await controller.deleteCategoryById(req.params.id);
    
    if (resp) {
      res.status(200).json({ status: true, message: "Category successfully deleted" });
    } else {
      res.status(500).json({status: false, message: "Unable to delete Category, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const resp = await controller.saveCategory(req);
    if (resp) {
      res.status(200).json({ status: true, message: "Category successfully updated" });
    } else {
      res.status(500).json({status: false, message: "Unable to update Category, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id/priority', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const resp = await controller.setPriority(req.params.id);
    if (resp) {
      res.status(200).json({ status: true, message: "Category priority updated" });
    } else {
      res.status(500).json({status: false, message: "Unable to update Category, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.post('/', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const resp = await controller.createCategory(req.body);
    if (resp) {
      res.status(200).json({ status: true, data: resp, message: "Category Created" });
    } else {
      res.status(500).json({status: false, message: "Unable to create category, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
})

router.get('/:id', async(req, res, next) => {
    try {
      const categ = await controller.getCategoryById(req.params.id);
      res.status(200).json(categ)
    } catch(err) {
      res.status(500).json({status: false, message: err});
    }
});

router.get('/', async(req, res, next) => {
  // get products
  if (req.query.id) {
    try {
      const categ = await controller.getCategoryById(req.query.id);
      res.status(200).json(categ)
    } catch(err) {
      res.status(500).json({status: false, message: err});
    }
  } else {
    try {
      const categ = await controller.getAllCategories();
      res.status(200).json(categ)
    } catch(err) {
      res.status(500).json({status: false, message: err});
    }
  }
});

module.exports = router
