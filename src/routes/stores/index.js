const router = require('express').Router();
const cors = require('cors');
const verify = require('../verifyToken');
const Store = require('../../pg/models/Stores');
const upload = require('../../middlewares/uploadSingle');

router.all('*', cors());

router.delete('/:id', verify, (req, res, next) => {
  // delete brands
  Store.findAll({ where: {id: req.params.id}})
  .then((store) => {
    Store.destroy({
      where: {
        id: store[0].id
      }
    }).then((deletedRecord) => {
        res.status(200).json({ data, deleteRecord, message: "Store successfully deleted" });
    }, (err) => {
        res.status(500).json(err);
    })
  })
});


router.put('/:id', [verify, upload], (req, res, next) => {
  const body = req.body;
  const sid = req.params.id;
  Store.update(
    {
      'name': body.name,
      'address': body.address,
      'city': body.city,
      'phone': body.phone,
      'country': body.country,
      'mobile': body.mobile,
      'township': body.township,
      'province': body.province,
      'email': body.email,
    },
    {
      where: {
        id: sid
      }
    }
  ).then((updated) => {
    let message = "Store Updated";
    // delete all images first in servers
    res.status(200).json({
      data: updated,
      message: message
    });
  }).catch((err) => {
    res.status(500).json(err)
  })
});

router.post('/',[verify, upload], (req, res, next) => {
  const body = req.body;

  Store.create({
    'name': body.name,
    'address': body.address,
    'city': body.city,
    'country': body.country,
    'phone': body.phone,
    'mobile': body.mobile,
    'township': body.township,
    'province': body.province,
    'email': body.email,
  }).then((store) => {
    res.status(200).json(store);
  })
})

router.get('/:id', async(req, res, next) => {
    let store = await Store.findAll({ where: {id: req.params.id}});
    res.json(store)
});

router.get('/', async(req, res, next) => {
  // get products
  let store = null;
  if (req.query.id) {
    try {
      store = await Store.findAll({ where: {id: req.query.id}});
      res.status(200).json(store)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
    try {
      store = await Store.findAll();
      res.status(200).json(store)
    } catch(err) {
      res.status(500).json(err)
    }
  }
});

module.exports = router