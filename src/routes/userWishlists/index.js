const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const verify = require('../verifyToken');
const Model = require('../../pg/models/UserWishlists');
const UserWishlist = Model.getModel();

router.all('*', cors());

var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})

var upload = multer({ storage: storage }).array('image')

router.delete('/wishlists/:id', verify, (req, res, next) => {
  // delete brands
  UserWishlist.findOne({ where: {id: req.params.id}})
  .then((comment) => {
    UserWishlist.destroy({
      where: {
        id: comment.id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        res.status(200).json({ status: true, message: "Wishlist successfully deleted" });
      } else {
        res.status(400).json({ status: false, message: "Error on deleting Wishlist!", error: e.toString(), req: req.body });
      }
    }, (err) => {
        res.status(500).json({status: false, message: err});
    })
  })
});


router.put('/wishlists/:id', [upload, verify], (req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  const user = req.user.id;
  UserWishlist.update(
    {
      'product': body.product,
      'user': user,
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

router.post('/wishlists', [upload, verify], (req, res, next) => {
  const body = req.body;
  const user = req.user.id;
  UserWishlist.create({
    'product': body.product,
    'user': user
  }).then((data) => {
    res.status(200).json({status: true, data: data});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/wishlists', async(req, res, next) => {
  // get statuses
  let data = null;
  if (req.query.id) {
    try {
      data = await UserWishlist.findOne({ where: {id: req.query.id}});
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      data = await UserWishlist.findAll();
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});


router.get('/userwishlists', [upload, verify], async(req, res, next) => {
  // get statuses
  const body = req.body;
  const user = req.user.id;
  if (body.product) {
    try {
      data = await UserWishlist.findOne({where: {user: user, product: body.product}});
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      data = await UserWishlist.findAll({ where: {user: user}});
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});


module.exports = router