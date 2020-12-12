const router = require('express').Router();
const cors = require('cors');
const verify = require('../verifyToken');
const upload = require('../../middlewares/uploadArray');

const SweetBoxType = require('../../pg/models/SweetBoxTypes');

router.all('*', cors());

router.delete('/:id', verify, (req, res, next) => {
  // delete brands
  SweetBoxType.findAll({ where: {id: req.params.id}})
  .then((brand) => {
    SweetBoxType.destroy({
      where: {
        id: brand[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({ status: deletedRecord, message: "SweetBox Type successfully deleted" });
    }, (err) => {
      res.status(500).json({status: false, message: err});
    })
  })
});

router.put('/:id', [verify, upload], (req, res, next) => {
  let dataInsert = null;
  const body = req.body;
  const bid = req.params.id;
  
  SweetBoxType.update(
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

router.post('/', verify, upload, (req, res, next) => {
  let dataEntry = null;
  const body = req.body;

  SweetBoxType.create({
    'name': body.name,
    'icon': body.icon
  }).then((sweetboxtype) => {
    res.status(200).json(sweetboxtype);
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/:id', async(req, res, next) => {
    let sweetboxtype = await SweetBoxType.findAll({ where: {id: req.params.id}});
    res.json(sweetboxtype)
});

router.get('/', async(req, res, next) => {
  // get products
  let sweetboxtype = null;
  if (req.query.id) {
    try {
      sweetboxtype = await SweetBoxType.findOne({ where: {id: req.query.id}});
      res.status(200).json(sweetboxtype)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      sweetboxtype = await SweetBoxType.findAll();
      res.status(200).json(sweetboxtype)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router