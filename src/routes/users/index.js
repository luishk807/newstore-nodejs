const router = require('express').Router();
const cors = require('cors');
const config = require('../../config');
const verify = require('../../middlewares/verifyToken');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/users');
const { checkCorsOrigins } = require('../../utils/server');
const { getTokenData } = require('../../utils');
const corsOption = {
  origin: checkCorsOrigins
}

router.all('*', cors(corsOption));

// TODO: only admin can delete
router.delete('/:id',verifyAdmin, async(req, res, next) => {

  try {
    const user = await controller.deleteById(req.params.id)
    if (user.status) {
      res.status(200).json({status: true, message: "User succesfully deleted"});
    } else {
      if (user.notFound) {
        res.status(400).json(user);
      } else {
        res.status(500).json(user);
      }
    }
  } catch(err) {
    res.status(500).json({status:false, message: err})
  }
});

// TODO: only admin can set admin role
router.put('/:id',[verify, parser.single('image')], async(req, res, next) => {
  const body = req.body;
  const id = req.params.id;

  
  const role = req.user ? req.user.type : null;

  if (body.userRole == 1 && (!role || (role && role != 1))) {
    res.status(401).json({status:false, message: 'unathorized user type'})
  }

  try {
    const user = await controller.update(body, id, req.file)
    if (user) {
      res.status(200).json({status: true, message: "User succesfully update"});
    } else {
      res.status(400).json({status: false, message: "Unable to update user, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status:false, message: err})
  }

});

// TODO: only admin can set admin role
router.post('/', [parser.single('image')], async(req, res, next) => {
  const body = req.body;

  const userData = getTokenData(req.headers['authorization']);

  const userRole = userData ? Number(userData.type) : -1;

  try {
    const user = await controller.create(body, req.file, config.adminRoles.includes(userRole));
    
    if (user) {
      res.status(200).json({status: true, message: "User succesfully created"});
    } else {
      res.status(400).json({status: false, message: "Unable to create user, please try again later"});
    }
  } catch(err) {
    res.status(500).json({status:false, message: err})
  }
});

router.get('/:id', [verify], async(req, res, next) => {
  if (req.user.type != 1 && req.user.id != req.params.id) {
    res.status(401).json("not authorized");
  }
  const user = await controller.findById(req.params.id);
  res.json(user);
});

router.get('/all/users', [verifyAdmin], async(req, res, next) => {
  try {
    const user = await controller.getAllUsers(req);
    res.status(200).json(user)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/', [verify], async(req, res, next) => {
  try {
    const user = await controller.findById(req.user.id);
    res.status(200).json(user)
  } catch(err) {
    res.status(404).json({status:false, message: err})
  }
});

module.exports = router
