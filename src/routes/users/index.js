const router = require('express').Router();
const cors = require('cors');
const config = require('../../config');
const bcrypt = require('bcryptjs');
const User = require('../../pg/models/Users');
const verify = require('../../middlewares/verifyToken');
const { Op } = require('sequelize');
const uuid = require('uuid');
const parser = require('../../middlewares/multerParser');
const s3 = require('../../services/storage.service');
const controller = require('../../controllers/users');

router.all('*', cors());

const aw3Bucket = `${config.s3.bucketName}/users`;

router.delete('/:id',verify, (req, res, next) => {
  controller.deleteUser(req.params.id)
    .then(result => {
      if (result.status) {
        res.status(200).json(result);
      } else {
        if (result.notFound) {
          res.status(404).json(result);
        } else {
          res.status(500).json(result);
        }
      }
    });
});


router.put('/:id',[verify, parser.single('image')], (req, res, next) => {
  let dataInsert = null;
  const body = req.body;
  const id = req.params.id;

  const partBodySaved = JSON.parse(body.saved)

    // delete current image
  if (partBodySaved[0] || req.file) {
    const paramsDelete = {
      Bucket: aw3Bucket,
      Key: partBodySaved[0],
    }
    s3.deleteObject(paramsDelete, (err, data) => {
      if (!err) {
        User.update({ img: null },{
          where: {
            id: id
          }
        });
      }
    })
  }
  if (req.file) {
    let myFile = req.file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid.v4()}.${fileType}`;
    const params = {
      Bucket: aw3Bucket,
      Key: fileName,
      Body: req.file.buffer,
    }
  
    s3.upload(params, (err, data) => {})

    dataInsert = {
      'last_name': body.last_name,
      'first_name': body.first_name,
      'date_of_birth': body.date_of_birth,
      'phone': body.phone,
      'gender': body.gender,
      'mobile': body.mobile,
      'status': body.status,
      'userRole': body.userRole,
      'img':fileName
    }
  } else {
    dataInsert = {
      'last_name': body.last_name,
      'first_name': body.first_name,
      'date_of_birth': body.date_of_birth,
      'phone': body.phone,
      'gender': body.gender,
      'mobile': body.mobile,
      'userRole': body.userRole,
      'status': body.status,
      'email': body.email,
    }
  }

  if (body.password && body.password !=='null') {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(body.password, salt, (err, hash) => {
        if (err) {
          res.status(500).json({status: false, message: err});
        }
        User.update({password: hash },{where: {id: id }})
      });
    })
  }
  User.update(
    dataInsert,
    {
      where: {
        id: id
      }
    }
  ).then((updated) => {
    let message = "User Updated";
    // delete all images first in servers
    res.status(200).json({
      status: updated,
      message: message
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [parser.single('image')], (req, res, next) => {
  const body = req.body;
  controller.create(body, req.file)
    .then(result => {
      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    });
});

router.get('/:id', [verify], async(req, res, next) => {
  const user = await controller.findById(req.params.id);
  res.json(user);
});

router.get('/', [verify], async(req, res, next) => {
  let user = null;
  if (req.query.id) {
    try {
      user = await User.findOne({ where: {id: req.query.id}, include: ['useStatus','userRoles']});
      res.status(200).json(user)
    } catch(err) {
      res.status(404).json({status:false, message: err})
    }
  } else {
    try {
      let query = {}
      if (req.user) {
        query = {
          where: {
            id: { [Op.ne]: req.user.id } // This does not work
          },
          include:['useStatus','userRoles']
        };
      } else {
        query = {
          include:['useStatus','userRoles']
        };
      }
      user = await User.findAll(query)
      res.status(200).json(user)
    } catch(err) {
      res.status(404).json({status:false, message: err})
    }
  }
});

module.exports = router
