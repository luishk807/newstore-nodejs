const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const controller = require('../../controllers/wishlists');
const parser = require('../../middlewares/multerParser');

router.all('*', cors());

router.delete('/:id', verify, async(req, res, next) => {
  // delete wishlist
  try {
    const wishlist = await controller.softDeleteUserWishlist(req.params.id);
    if (wishlist) {
      res.status(200).json({ status: true, message: "Wishlist successfully deleted" });
    } else {
      res.status(400).json({ status: false, message: "Error on deleting Wishlist!", error: e.toString(), req: req.body });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }

});

router.delete('/admin/:id', verify, async(req, res, next) => {
  // delete wishlist
  try {
    const wishlist = await controller.deleteWishlist(req.params.id);
    if (wishlist) {
      res.status(200).json({ status: true, message: "Wishlist successfully deleted" });
    } else {
      res.status(400).json({ status: false, message: "Error on deleting Wishlist!", error: e.toString(), req: req.body });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }

});


router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  const id = req.params.id;

  try {
    const wishlist = await controller.updateWishlist(req, id);
    if (wishlist) {
      res.status(200).json({ status: true, message: "Wishlist successfully updated" });
    } else {
      res.status(400).json({ status: false, message: "Error on updated Wishlist!", error: e.toString(), req: req.body });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }

});

router.post('/', [verify, parser.none()], async(req, res, next) => {  
  try {
    const wishlist = await controller.createWishlist(req);
    if (wishlist) {
      res.status(200).json({ status: true, message: "Wishlist successfully created" });
    } else {
      res.status(400).json({ status: false, message: "Error on created Wishlist!", error: e.toString(), req: req.body });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
})

router.get('/', async(req, res, next) => {
  // get statuses
  let data = null;
  if (req.query.id) {
    try {
      data = await controller.getWishlistById(req.query.id);
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      data = await controller.getAllWishlist();
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

router.delete('/user/:id', verify, async(req, res, next) => {
  // delete wishlist
  try {
    const wishlist = await controller.deleteUserWishlist(req);
    if (wishlist) {
      res.status(200).json({ status: true, message: "Wishlist successfully deleted" });
    } else {
      res.status(400).json({ status: false, message: "Error on deleting Wishlist!", error: e.toString(), req: req.body });
    }
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/user', [verify], async(req, res, next) => {
  // get statuses
  const user = req.user.id;
  if (req.query.product) {
    try {
      data = await controller.getUserWishlistById(req);
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      data = await controller.getAllWishlistByUser(user);
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router
