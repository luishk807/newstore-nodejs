const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/colors');

router.all('*', cors());

router.delete('/:id', verifyAdmin,  async(req, res, next) => {
  // delete color
  try {
    const resp = await controller.trashedColorById(req.params.id);
    res.status(resp.code).json(resp);
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.delete('/admin/:id', verifyAdmin,  async(req, res, next) => {
  // delete color
  try {
    const resp = await controller.deleteColorById(req.params.id);
    res.status(resp.code).json(resp);
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});


router.put('/:id', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const resp = await controller.updateColor(req);
    if (resp) {
      res.status(200).json({ status: true, message: "Color successfully updated" });
    } else {
      res.status(500).json({status: false, message: "Unable to update color, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.post('/', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const resp = await controller.createColor(req);
    if (resp) {
      res.status(200).json({ status: true, message: "Color successfully created" });
    } else {
      res.status(500).json({status: false, message: "Unable to create color, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
})

router.get('/product/:product', async(req, res, next) => {
  try {
    const color = await controller.getActiveColorByProductId(req.params.product);
    res.status(200).json(color)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/:id', async(req, res, next) => {
  try {
    const color = await controller.getColorById(req.params.id);
    res.status(200).json(color)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/filters/bulk', async(req, res, next) => {
  // get colors
  try {
    const color = await controller.getColorByIds(req.query.ids);
    res.status(200).json(color)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/admin/colors/pages/all', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const color = await controller.getAllActiveColorsWithFilters(req.user, req.query);
    res.status(200).json(color)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/', async(req, res, next) => {
  // get colors
  try {
    const color = await controller.getAllActiveColor();
    res.status(200).json(color)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

module.exports = router