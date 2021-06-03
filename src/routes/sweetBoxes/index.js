const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const controller = require('../../controllers/sweetBoxes')
const parser = require('../../middlewares/multerParser');

router.all('*', cors());

router.get('/', async(req, res, next) => {
  // get statuses
  let sweetbox = null;
  
  if (req.query.id) {
    try {
      sweetbox = await controller.searchSweetBoxById(req.params.id);
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else if (req.query.type) {
    try {
      sweetbox = await controller.getActiveSweetBoxByType(req.query.type);
      res.json(sweetbox)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      sweetbox = await controller.getAllSweetBox();
      res.json(sweetbox)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

router.get('/:id', async(req, res, next) => {
  // get statuses

  try {
    const sweetbox = await controller.searchSweetBoxById(req.params.id);
    res.json(sweetbox)
  } catch(err) {
    res.send({status: false, message: err})
  }
});

router.get('/status/:id', async(req, res, next) => {
  // get statuses

  try {
    const sweetbox = await controller.searchActiveSweetBoxById(req.params.id);
    res.json(sweetbox)
  } catch(err) {
    res.send({status: false, message: err})
  }
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  try {
    const sweetbox = await controller.createSweetBox(req.body);
    res.status(200).json({
      status: true,
      message: 'Sweet Box created',
      data: sweetbox
    })
  } catch(err) {
    res.status(500).send({status: false, message: err})
  }
})

router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  try {
    const sweetbox = await controller.saveSweetBox(body, bid);
    res.status(200).json({
      status: true,
      message: 'Sweet Box updated',
      data: sweetbox
    })
  } catch(err) {
    res.status(500).send({status: false, message: err})
  }
});

router.delete('/:id', verify, async(req, res, next) => {
  // delete brands
  try {
    const deletedRecord = await controller.deleteSweetBox(req.params.id);
    res.status(200).json({ status: deletedRecord, message: "Sweet Box successfully deleted" })
  } catch(err) {
    res.status(500).send({status: false, message: err})
  }
});

module.exports = router