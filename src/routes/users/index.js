const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

const Model = require('../../pg/models/Users');
const UserAddressModel = require('../../pg/models/UserAddresses');

const AWS = require('aws-sdk');
const uuid = require('uuid');

const User = Model.getModel();
const UserAddress = UserAddressModel.getModel();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
})

router.all('*', cors());

User.hasMany(UserAddress, { as: "user_addresses" });

UserAddress.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: 'CASCADE',
});

var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})

var upload = multer({ storage: storage }).single('image')

const aw3Bucket = `${process.env.AWS_BUCKET_NAME}/users`;

router.delete('/users/:id', (req, res, next) => {
  // delete brands
  User.findAll({ where: {id: req.params.id}, include:['user_addresses']})
  .then((user) => {
    const userImage = user[0].img
    User.destroy({
      where: {
        id: user[0].id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        // console.log(deletedRecord, mapFiles)
        try {
          const params = {
            Bucket: aw3Bucket,
            Key: userImage,
          }
          s3.deleteObject(params, (err, data) => {})
          res.status(200).json({ message: "User successfully deleted" });
        } catch (e) {
          res.status(400).json({ message: "User delete, but error on deleting image!", error: e.toString(), req: req.body });
        }
      }
    }, (err) => {
        res.status(500).json(err);
    })
  })
});


router.put('/users/:id', upload, (req, res, next) => {
  let dataInsert = null;
  const body = req.body;
  const vid = req.params.id;
  if (req.file) {
    // insert image
    let myFile = req.file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid.v4()}.${fileType}`;
    const params = {
      Bucket: aw3Bucket,
      Key: fileName,
      Body: req.file.buffer,
    }
  
    s3.upload(params, (err, data) => {
      if (err) {
        //res.status(500).json(err)
      }
    })

    // delete current image
    User.findAll({ where: {id: vid}}).then((user) => {
      const paramsDelete = {
        Bucket: aw3Bucket,
        Key: User.img,
      }
      s3.deleteObject(paramsDelete, (err, data) => {
        if (err) {
        //  res.status(500).json(err)
        }
      })
    })

    dataInsert = {
      'last_name': body.last_name,
      'first_name': body.first_name,
      'password': body.password,
      'date_of_birth': body.date_of_birth,
      'phone': body.phone,
      'gender': body.gender,
      'mobile': body.mobile,
      'status': body.status,
      'img':fileName
    }
  } else {
    dataInsert = {
      'last_name': body.last_name,
      'first_name': body.first_name,
      'password': body.password,
      'date_of_birth': body.date_of_birth,
      'phone': body.phone,
      'gender': body.gender,
      'mobile': body.mobile,
      'status': body.status,
      'email': body.email,
    }
  }
  User.update(
    dataInsert,
    {
      where: {
        id: vid
      }
    }
  ).then((updated) => {
    let message = "User Updated";
    // delete all images first in servers
    res.status(200).json({
      data: updated,
      message: message
    });
  }).catch((err) => {
    res.status(500).json(err)
  })
});

router.post('/users', upload, (req, res, next) => {
  let dataEntry = null;
  const body = req.body;
  if (req.file) {
    let myFile = req.file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid.v4()}.${fileType}`;
  
    const params = {
      Bucket: aw3Bucket,
      Key: fileName,
      Body: req.file.buffer,
    }
  
    s3.upload(params, (err, data) => {
      if (err) {
        res.status(500).send(err)
      }
    })
    
    dataEntry = {
      'last_name': body.last_name,
      'first_name': body.first_name,
      'password': body.password,
      'date_of_birth': body.date_of_birth,
      'phone': body.phone,
      'gender': body.gender,
      'mobile': body.mobile,
      'email': body.email,
      'img':fileName
    }
  } else {
    dataEntry = {
      'last_name': body.last_name,
      'first_name': body.first_name,
      'password': body.password,
      'date_of_birth': body.date_of_birth,
      'phone': body.phone,
      'gender': body.gender,
      'mobile': body.mobile,
      'email': body.email,
    }
  }

  User.create(dataEntry).then((user) => {
    res.status(200).json(user);
  })
})

router.get('/users/:id', async(req, res, next) => {
    let user = await User.findAll({ where: {id: req.params.id}});
    res.json(user)
});

router.get('/users', async(req, res, next) => {
  // get products
  let user = null;
  if (req.query.id) {
    try {
      user = await User.findAll({ where: {id: req.query.id},include:['user_addresses']});
      res.status(200).json(user)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
    try {
      user = await User.findAll({include:['user_addresses']});
      res.status(200).json(user)
    } catch(err) {
      res.status(500).json(err)
    }
  }
});

module.exports = router