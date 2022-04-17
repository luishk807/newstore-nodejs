const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/brands');

router.all('*', cors());

router.delete('/admin/:id', verifyAdmin,  async(req, res, next) => {
  // delete brands
  try {
    const resp = await controller.deleteBrandById(req.params.id);
    
    if (resp.status) {
      res.status(200).json({ status: true, message: resp.message });
    } else {
      res.status(500).json({status: false, message: resp.message });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.delete('/:id', verifyAdmin,  async(req, res, next) => {
  // delete brands
  try {
    const resp = await controller.softDeleteBrandById(req.params.id);

    if (resp.status) {
      res.status(200).json({ status: true, message: resp.message });
    } else {
      res.status(500).json({status: false, message: resp.message });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.put('/:id', [verifyAdmin, parser.single('image')], async(req, res, next) => {
  // update brands
  try {
    const resp = await controller.updateBrandById(req);

    if (resp.status) {
      res.status(200).json({ status: true, message: resp.message });
    } else {
      res.status(500).json({status: false, message: resp.message });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.post('/', [verifyAdmin, parser.single('image')], async(req, res, next) => {
  // create brand
  try {
    const resp = await controller.createBrand(req);

    if (resp.status) {
      res.status(200).json({ status: true, message: resp.message });
    } else {
      res.status(500).json({status: false, message: resp.message });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
})

router.get('/:id', async(req, res, next) => {
  const brand = await controller.getActiveBrandById(req.params.id);
  res.json(brand)
});

router.get('/admin/:id', verifyAdmin, async(req, res, next) => {
  const brand = await controller.getBrandById(req.params.id);
  res.json(brand)
});

router.get('/', async(req, res, next) => {
  // get products
  if (req.query.id) {
    try {
      const brand = await controller.getActiveBrandById(req.params.id);
      res.status(200).json(brand)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      const brand = await controller.getAllActiveBrandById();
      res.status(200).json(brand)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router