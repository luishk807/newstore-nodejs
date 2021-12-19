const router = require('express').Router();
const cors = require('cors');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const verify = require('../../middlewares/verifyToken');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/vendors');
const { checkCorsOrigins } = require('../../utils/server');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));

router.delete('/:id', verify, async(req, res, next) => {
  // delete vendor
  try {
    const resp = await controller.deleteVendor(req.params.id);
    if (resp) {
      res.status(200).json({ status: true, message: "Vendor successfully deleted" });
    } else {
      res.status(500).json({status: false, message: "Error deleting vendor, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});


router.put('/:id', [verify, parser.single('image')], async(req, res, next) => {
  const body = req?.body;
  const file = req?.file;

  if (!body) {
      res.status(500).json({status: false, message: "Unable to update vendor, please try again later"});
      return;
  }

  try {
    const resp = await controller.updateVendor(body, file, req.params.id);
    if (resp) {
      res.status(200).json({ status: true, message: "Vendor Updated" });
    } else {
      res.status(400).json({status: false, message: "Unable to update vendor, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.post('/', [verify, parser.single('image')], async(req, res, next) => {
  const body = req?.body;
  const file = req?.file;
  
  if (!body) {
    res.status(400).json({status: false, message: "Unable to create order"});
    return;
  };

  try {
    const resp = await controller.createVendor(body, file);
    if (resp) {
      res.status(200).json({ status: true, message: "Vendor Updated", data: resp});
    } else {
      res.status(400).json({status: false, message: "Unable to update vendor, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
})

router.get('/user', [verify], async(req, res, next) => {
  // get products

  if (!req.query.id) {
    res.status(200).json([]);
    return;
  }

  try {
    const resp = await controller.getVendorByUserId(req.query.id);
    if (resp) {
      res.status(200).json(resp);
    } else {
      res.status(200).json([]);
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/:id', async(req, res, next) => {
  if (!req.params.id) {
    res.status(200).json([]);
    return;
  }
  
  try {
    const vendor = await controller.getVendorById(req.params.id);
    res.status(200).json(vendor)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/', verifyAdmin, async(req, res, next) => {
  // get vendors
  if (req.query.id) {
    try {
      const vendor = await controller.getVendorById(req.params.id);
      res.status(200).json(vendor)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      const vendor = await controller.getAllActiveVendors();
      res.status(200).json(vendor)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router