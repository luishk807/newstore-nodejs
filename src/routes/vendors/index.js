const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const verify = require('../verifyToken');

const Model = require('../../pg/models/Vendors');

const AWS = require('aws-sdk');
const uuid = require('uuid');

const Vendor = Model.getModel();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
})

router.all('*', cors());

var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})

var upload = multer({ storage: storage }).single('image')

const aw3Bucket = `${process.env.AWS_BUCKET_NAME}/vendors`;

router.delete('/vendors/:id', verify, (req, res, next) => {
  // delete brands
  Vendor.findAll({ where: {id: req.params.id}})
  .then((vendor) => {
    const vendorImage = vendor[0].img
    Vendor.destroy({
      where: {
        id: vendor[0].id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        // console.log(deletedRecord, mapFiles)
        try {
          const params = {
            Bucket: aw3Bucket,
            Key: vendorImage,
          }
          s3.deleteObject(params, (err, data) => {})
          res.status(200).json({ status: true, message: "Vendor successfully deleted" });
        } catch (e) {
          res.status(400).json({ status: false, message: "Vendor delete, but error on deleting image!", error: e.toString(), req: req.body });
        }
      }
    }, (err) => {
        res.status(500).json({status: false, message: err});
    })
  })
});


router.put('/vendors/:id', [verify, upload], (req, res, next) => {
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
    Vendor.findAll({ where: {id: vid}}).then((vendor) => {
      const paramsDelete = {
        Bucket: aw3Bucket,
        Key: Vendor.img,
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
      'description': body.description,
      'position': body.position,
      'email': body.email,
      'img':fileName
    }
  } else {
    dataInsert = {
      'last_name': body.last_name,
      'description': body.description,
      'first_name': body.first_name,
      'password': body.password,
      'position': body.position,
      'email': body.email,
    }
  }
  Vendor.update(
    dataInsert,
    {
      where: {
        id: vid
      }
    }
  ).then((updated) => {
    let message = "Vendor Updated";
    // delete all images first in servers
    res.status(200).json({
      data: updated,
      message: message
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/vendors', [verify, upload], (req, res, next) => {
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
      'description': body.description,
      'position': body.position,
      'email': body.email,
      'img':fileName
    }
  } else {
    dataEntry = {
      'last_name': body.last_name,
      'first_name': body.first_name,
      'description': body.description,
      'password': body.password,
      'position': body.position,
      'email': body.email,
    }
  }

  Vendor.create(dataEntry).then((vendor) => {
    res.status(200).json({status: true, data: vendor});
  })
})

router.get('/vendors/:id', async(req, res, next) => {
    let vendor = await Vendor.findAll({ where: {id: req.params.id}, include: ['vendor_rates']});
    res.json(vendor)
});

router.get('/vendors', async(req, res, next) => {
  // get products
  let vendor = null;
  if (req.query.id) {
    try {
      vendor = await Vendor.findOne({ where: {id: req.query.id}, include: ['vendor_rates']});
      res.status(200).json(vendor)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      vendor = await Vendor.findAll({include: ['vendor_rates']});
      res.status(200).json(vendor)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router