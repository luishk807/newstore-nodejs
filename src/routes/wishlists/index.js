const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const UserWishlist = require('../../pg/models/UserWishlists');
const parser = require('../../middlewares/multerParser');

router.all('*', cors());

router.delete('/:id', verify, (req, res, next) => {
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


router.put('/:id', [verify, parser.none()], (req, res, next) => {
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

router.post('/', [verify, parser.none()], (req, res, next) => {
  const body = req.body;
  const user = req.user.id;
  UserWishlist.create({
    'product': body.product,
    'user': user
  }).then((data) => {
    res.status(200).json({status: true, message: 'Success: Wishlist Added', data: data});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/', async(req, res, next) => {
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

router.delete('/user/:id', verify, (req, res, next) => {
  // delete brands
  const user = req.user.id;

  UserWishlist.findOne({ where: {user: user, product: req.params.id}})
  .then((data) => {
    UserWishlist.destroy({
      where: {
        id: data.id
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

router.get('/user', [verify], async(req, res, next) => {
  // get statuses
  const user = req.user.id;
  if (req.query.product) {
    try {
      data = await UserWishlist.findOne({where: {user: user, product: req.query.product}});
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      data = await UserWishlist.findAll({ where: {user: user}, include: ['wishlistProduct','userWishlistUser','userWishlistStatus']});
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router
