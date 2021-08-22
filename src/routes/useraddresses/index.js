const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const controller = require('../../controllers/userAddresses');
const parser = require('../../middlewares/multerParser');

router.all('*', cors());

router.delete('/:id', verify, async(req, res, next) => {
  // delete brands
  try {
    await controller.deleteUserAdressById(req.params.id);
    res.status(200).json({ status: true, message: "User address successfully deleted" });
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});


router.put('/:id', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;

  if (req.user && !req.body.user) {
    body['user'] = req.user.id;
  }

  try {
    const address = await controller.saveUserAdress(body, req.params.id);
    res.status(200).json({status: true, message: 'Success: Adddress Saved', data: address});
  } catch(err) {
    console.log("err", err)
    res.status(500).json({status: false, message: err});
  }
});

router.post('/', [verify, parser.none()], async(req, res, next) => {
  try {
    const address = await controller.createUserAdress(req);
    res.status(200).json({status: true, message: 'Success: Adddress Saved', data: address});
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
})

router.get('/:id', [verify, parser.none()], async(req, res, next) => {
  try {
    const address = await controller.getUserAdressById(req.params.id, req.user);
    res.status(200).json(address)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/addresses/user', [verify, parser.none()], async(req, res, next) => {
  try {
    const address = await controller.getUserAdressByUserId(req.user.id);
    res.status(200).json(address)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/addresses/user/:id', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const address = await controller.getUserAdressByUserId(req.params.id);
    res.status(200).json(address)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/all/addresses', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const address = await controller.getUserAdresses();
    res.status(200).json(address)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/', [verify, parser.none()], async(req, res, next) => {
  const user = req.user.id;
  const byUser = req.query.user;
  const byId = req.query.id;
  let address = null;

  if (byUser) {
    const confirm = await controller.checkValidUser(byUser, req.user);
    if (!confirm) {
      res.status(401).json('not authorized');
    }
    try {
      address = await controller.getUserAdressByUserId(byUser);
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  } else if (byId) {
    const confirm = await controller.checkValidUser(byUser, req.user);
    if (!confirm) {
      res.status(401).json('not authorized');
    }
    try {
      address = await controller.getUserAdressById(byId);
      res.status(200).json(address)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
    if (user) {
      const confirm = await controller.checkValidUser(byUser, req.user);
      if (!confirm) {
        res.status(401).json('not authorized');
      }
      try {
        address = await controller.getUserAdressByUserId(user);
        res.status(200).json(address)
      } catch(err) {
        res.status(500).json(err)
      }
    } else {
      if (req.user && req.user.type !== 1) {
        res.status(401).json('not authorized');
      }
      try {
        address = await controller.getUserAdresses();
        res.status(200).json(address)
      } catch(err) {
        res.status(500).json(err)
      }
    }
  }
});

module.exports = router