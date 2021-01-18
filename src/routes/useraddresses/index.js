const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const UserAddress = require('../../pg/models/UserAddresses');
const parser = require('../../middlewares/multerParser');

const includes = ['addressesUsers', 'addressCountry', 'addressProvince', 'addressDistrict', 'addressCorregimiento']; 

router.all('*', cors());

router.delete('/:id', verify, (req, res, next) => {
  // delete brands
  UserAddress.findAll({ where: {id: req.params.id}})
  .then((address) => {
    UserAddress.destroy({
      where: {
        id: address[0].id
      }
    }).then((deletedRecord) => {
        res.status(200).json({ status: true, deletedRecord, message: "User address successfully deleted" });
    }, (err) => {
        res.status(500).json({status: true, message: err});
    })
  })
});


router.put('/:id', [verify, parser.none()], (req, res, next) => {
  const body = req.body;
  if (body.favorite) {
     UserAddress.update(
      {
        'selected': null
      },
      {
        where: {
          userId: body.user
        }
      }
    ).then((address) => {
      UserAddress.update(
      {
        'selected': true
      },
      {
        where: {
          id: body.favorite
        }
      }).then((address) => {
        res.status(200).json({status: true, message: 'Success: Adddress Saved', data: address});
      }).catch((err) => {
        res.status(500).json({status: false, message: err})
      })
    }).catch((err) => {
      res.status(500).json({status: false, message: err})
    }) 
  } else if (body.unfavorite) {
    UserAddress.update(
    {
      'selected': null
    },
    {
      where: {
        id: body.unfavorite
      }
    }).then((address) => {
      res.status(200).json({status: true, message: 'Success: Adddress Saved', data: address});
    }).catch((err) => {
      res.status(500).json({status: false, message: err})
    })
 } else {
    const sid = req.params.id;
    const user = req.body && req.body.user ? req.body.user : req.user.id;
    UserAddress.update(
      {
        'address': body.address,
        'name': body.name,
        'zip': body.zip,
        'user': user,
        'email': body.email,
        'country': body.country,
        'phone': body.phone,
        'mobile': body.mobile,
        'township': body.township,
        'province': body.province,
        'district': body.district,
        'corregimiento': body.corregimiento,
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
  }
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  const user = req.body && req.body.user ? req.body.user : req.user.id;
  let selected = body.selected ? body.selected : null;
  if (body.selected) {
    const resp = await UserAddress.update(
      {
        'selected': null
      },
      {
        where: {
          userId: user
        }
      }
    )
  }
  
  UserAddress.create({
    'address': body.address,
    'name': body.name,
    'zip': body.zip,
    'user': user,
    'country': body.country,
    'phone': body.phone,
    'mobile': body.mobile,
    'email': body.email,
    'township': body.township,
    'selected': selected,
    'province': body.province,
    'district': body.district,
    'corregimiento': body.corregimiento,
  }).then((address) => {
    res.status(200).json({status: true, message: 'Success: Adddress Saved', data: address});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/:id', [verify, parser.none()], async(req, res, next) => {
  console.log(req)
  const id = req.query.id;
  let address = null;
  if (id) {
    try {
      address = await UserAddress.findOne({ where: {id: req.query.id}, include: includes});
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
    res.status(500).json(err)
  }
});

router.get('/', [verify, parser.none()], async(req, res, next) => {
  const user = req.user.id;
  const byUser = req.query.user;
  const byId = req.query.id;
  let address = null;
  if (byUser) {
    try {
      address = await UserAddress.findAll({ where: {user: byUser}, include: includes});
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  } else if (byId) {
    try {
      address = await UserAddress.findOne({ where: {id: byId, user: user}, include: includes});
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
    if (user) {
      try {
        address = await UserAddress.findAll({ where: {user: user}, include: includes});
        res.status(200).json(address)
      } catch(err) {
        res.status(500).json(err)
      }
    } else {
      try {
        address = await UserAddress.findAll({include: includes});
        res.status(200).json(address)
      } catch(err) {
        res.status(500).json(err)
      }
    }
  }
});

// for admin
router.get('/', [verify, parser.none()], async(req, res, next) => {
  // get products
  const user = req.body.user;
  
  let address = null;
  if (user) {
    try {
      address = await UserAddress.findAll({ where: {user: user}, include: includes});
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
    try {
      address = await UserAddress.findAll({ where: {id: req.body.id}, include: includes});
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  }
});

module.exports = router