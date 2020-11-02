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
  const user = req.user.id;
  UserAddress.update(
    {
      'address': body.address,
      'name': body.name,
      'city': body.city,
      'zip': body.zip,
      'user': user,
      'country': body.country,
      'phone': body.phone,
      'mobile': body.mobile,
      'township': body.township,
      'province': body.province,
    },
    {
      where: {
        id: sid
      }
    }
  ).then((address) => {
    res.status(200).json({status: true, message: 'Success: Adddress Saved', data: address});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/useraddresses', [verify, upload], (req, res, next) => {
  const body = req.body;
  const user = req.user.id;
  UserAddress.create({
    'address': body.address,
    'name': body.name,
    'city': body.city,
    'zip': body.zip,
    'user': user,
    'country': body.country,
    'phone': body.phone,
    'mobile': body.mobile,
    'township': body.township,
    'province': body.province,
  }).then((address) => {
    res.status(200).json({status: true, message: 'Success: Adddress Saved', data: address});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/useraddresses', verify, async(req, res, next) => {
  // get products
  const user = req.user.id;
  
  let address = null;
  if (user) {
    try {
      address = await UserAddress.findAll({ where: {user: user}, include:['addressesUsers', 'addressCountry']});
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
    try {
      address = await UserAddress.findAll({ where: {id: req.query.id}, include:['addressesUsers', 'addressCountry']});
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
      address = await UserAddress.findAll({ where: {user: user}, include:['addressesUsers', 'addressCountry']});
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