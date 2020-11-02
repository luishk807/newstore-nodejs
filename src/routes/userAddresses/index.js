const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const verify = require('../verifyToken');
const UserAddress = require('../../pg/models/UserAddresses');
const User = require('../../pg/models/Users');

router.all('*', cors());

var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})

var upload = multer({ storage: storage }).single('image')

router.delete('/useraddresses/:id', verify, (req, res, next) => {
  // delete brands
  UserAddress.findAll({ where: {id: req.params.id}})
  .then((address) => {
    UserAddress.destroy({
      where: {
        id: address[0].id
      }
    }).then((deletedRecord) => {
        res.status(200).json({ data, deleteRecord, message: "User address successfully deleted" });
    }, (err) => {
        res.status(500).json(err);
    })
  })
});


router.put('/useraddresses/:id', [verify, upload], (req, res, next) => {
  const body = req.body;
  const sid = req.params.id;
  UserAddress.update(
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
    let message = "User address Updated";
    // delete all images first in servers
    res.status(200).json({
      data: updated,
      message: message
    });
  }).catch((err) => {
    res.status(500).json(err)
  })
});

router.post('/useraddresses', [verify, upload], (req, res, next) => {
  const body = req.body;

  UserAddress.create({
    'name': body.name,
    'address': body.address,
    'city': body.city,
    'userId': body.userId,
    'country': body.country,
    'phone': body.phone,
    'mobile': body.mobile,
    'township': body.township,
    'province': body.province,
    'email': body.email,
  }).then((address) => {
    res.status(200).json(address);
  })
})

router.get('/useraddresses/:id', verify, async(req, res, next) => {
    let address = await UserAddress.findAll({ where: {id: req.params.id}});
    res.json(address)
});

router.get('/useraddresses', verify, async(req, res, next) => {
  // get products
  const user = req.user.id;
  
  let address = null;
  if (user) {
    try {
      address = await UserAddress.findAll({ where: {user: user}, include:['addressesUsers']});
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
    try {
      address = await UserAddress.findAll({ where: {id: req.query.id}, include:['addressesUsers']});
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  }
});

// for admin
router.get('/usersaddresses', [verify, upload], async(req, res, next) => {
  // get products
  const user = req.body.user;
  
  let address = null;
  if (user) {
    try {
      address = await UserAddress.findAll({ where: {user: user}, include:['addressesUsers']});
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
    try {
      address = await UserAddress.findAll({ where: {id: req.body.id}, include:['addressesUsers']});
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  }
});

module.exports = router