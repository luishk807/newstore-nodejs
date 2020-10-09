const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

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

router.delete('/vendors/:id', (req, res, next) => {
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
          res.status(200).json({ message: "Vendor successfully deleted" });
        } catch (e) {
          res.status(400).json({ message: "Vendor delete, but error on deleting image!", error: e.toString(), req: req.body });
        }
      }
    }, (err) => {
        res.status(500).json(err);
    })
  })
});


router.put('/vendors/:id', upload, (req, res, next) => {
  let dataInsert = null;
  const body = req.body;
  const bid = req.params.id;
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
    Vendor.findAll({ where: {id: bid}}).then((vendor) => {
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
      'name': body.name,
      'status': body.status,
      'img': fileName,
    }
  } else {
    dataInsert = {
      'name': body.name,
      'status': body.status,
    }
  }
  Vendor.update(
    dataInsert,
    {
      where: {
        id: bid
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
    res.status(500).json(err)
  })
});

router.post('/vendors', upload, (req, res, next) => {
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
      'name': body.name,
      'img':fileName
    }
  } else {
    dataEntry = {
      'name': body.name,
    }
  }

  Vendor.create(dataEntry).then((product) => {
    res.status(200).json(product);
  })
})

router.get('/vendors/:id', async(req, res, next) => {
    let vendor = await Vendor.findAll({ where: {id: req.params.id}});
    res.json(vendor)
});

router.get('/vendors', async(req, res, next) => {
  // get products
  let vendor = null;
  if (req.query.id) {
    try {
      vendor = await Vendor.findAll({ where: {id: req.query.id}});
      res.status(200).json(vendor)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
    try {
      vendor = await Vendor.findAll();
      res.status(200).json(vendor)
    } catch(err) {
      res.status(500).json(err)
    }
  }
});

module.exports = router