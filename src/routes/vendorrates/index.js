const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const VendorRate = require('../../pg/models/VendorRates');

router.all('*', cors());

router.delete('/:id', verify, (req, res, next) => {
  // delete brands
  VendorRate.findOne({ where: {id: req.params.id}})
  .then((comment) => {
    VendorRate.destroy({
      where: {
        id: comment.id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        res.status(200).json({ status: true, message: "Rate successfully deleted" });
      } else {
        res.status(400).json({ status: false, message: "Error on deleting Rate!", error: e.toString(), req: req.body });
      }
    }, (err) => {
        res.status(500).json({status: false, message: err});
    })
  })
});


router.put('/:id', [verify], (req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  VendorRate.update(
    {
      'rate': body.rate,
      'title': body.title,
      'user': body.user,
      'comment': body.comment,
      'status': body.status
    },
    {
      where: {
        id: id
      }
    }
  ).then((updated) => {
    res.status(200).json({
      data: updated,
      message: "Rate Updated"
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [verify], (req, res, next) => {
  const body = req.body;
  VendorRate.create({
    'vendor': body.vendor,
    'title': body.title,
    'user': body.user,
    'comment': body.comment,
    'rate': body.rate,
  }).then((data) => {
    res.status(200).json({status: true, data: data});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/', async(req, res, next) => {
  // get statuses
  let data = null;
  if (req.query.id) {
    try {
      data = await VendorRate.findOne({ where: {id: req.query.id}});
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      data = await VendorRate.findAll();
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router