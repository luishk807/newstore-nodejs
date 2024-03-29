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
    const user = await controller.trashedUserById(req.params.id)
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

  const isEmailTaken = await controller.isEmailTaken(body.email, id);

  if (isEmailTaken) {
    res.status(500).json({status: false, message: "Email address already in use"});
    return;
  }
  
  
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

  const isEmailTaken = await controller.isEmailTaken(body.email);

  if (isEmailTaken) {
    res.status(400).json({status: false, message: "Email address already in use"});
    return;
  }

  try {
    const user = await controller.create(body, req.file, config.adminRoles.includes(userRole));
    if (user.status) {
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

router.get('/admin/:id', [verifyAdmin], async(req, res, next) => {
  const user = await controller.findAdminById(req.params.id);
  res.json(user);
});

router.get('/all/users', [verifyAdmin], async(req, res, next) => {
  try {
    const user = await controller.getAllActiveUsers(req);
    res.status(200).json(user)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/admin/users/pages/all', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const order = await controller.getAllActiveUsersWithFilters(req.user, req.query);
    res.status(200).json(order)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

router.get('/all/entire/users', [verifyAdmin], async(req, res, next) => {
  try {
    const user = await controller.getAllUsers(req);
    res.status(200).json(user)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/', [verify], async(req, res, next) => {
  try {
    const user = await controller.findActiveById(req.user.id);
    res.status(200).json(user)
  } catch(err) {
    res.status(400).json({status:false, message: err})
  }
});

module.exports = router
