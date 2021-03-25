const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const SweetBox = require('../../pg/models/SweetBoxes');
const controller = require('../../controllers/sweetBoxes')
const parser = require('../../middlewares/multerParser');

const includes = [
  'sweetBoxSweetboxProduct', 
  'sweetboxesStatus', 
  'sweetBoxTypeSweetBox'
];

router.all('*', cors());

router.get('/', async(req, res, next) => {
  // get statuses
  let sweetbox = null;
  
  if (req.query.id) {
    try {
      sweetbox = await SweetBox.findOne({ where: {id: req.query.id}, include: includes});
      res.json(sweetbox)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else if (req.query.type) {
    try {
      sweetbox = await SweetBox.findAll({ where: {sweetBoxTypeId: req.query.type, statusId: 1}, include: includes});
      res.json(sweetbox)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      sweetbox = await SweetBox.findAll({ include: includes});
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

router.post('/', [verify, parser.none()], (req, res, next) => {
  const body = req.body;
  SweetBox.create({
    'name': body.name,
    'sweetBoxType': body.sweetBoxType,
  }).then((data) => {
    res.status(200).json({status: true, data: data, message: 'Sweet box created'});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.put('/:id', [verify, parser.none()], (req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  
  SweetBox.update(
    {
      'name': body.name,
      'sweetBoxType': body.sweetBoxType,
      'status': body.status
    },
    {
      where: {
        id: bid
      }
    }
  ).then((updated) => {
    res.status(200).json({
      status: true,
      message: 'Sweet Box Updated'
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.delete('/:id', verify, (req, res, next) => {
  // delete brands
  SweetBox.findAll({ where: {id: req.params.id}})
  .then((brand) => {
    SweetBox.destroy({
      where: {
        id: brand[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({ status: deletedRecord, message: "Sweet Box successfully deleted" });
    }, (err) => {
      res.status(500).json({status: false, message: err});
    })
  })
});

module.exports = router