const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const verify = require('../verifyToken');
const Model = require('../../pg/models/Brands');

const StatusModel = require('../../pg/models/Statuses');
const ProductModel = require('../../pg/models/Products');
const Product = ProductModel.getModel();

const AWS = require('aws-sdk');
const uuid = require('uuid');

const Brand = Model.getModel();
const Statuses = StatusModel.getModel();

Brand.hasMany(Product, { as: "products" });

Product.belongsTo(Brand, {
  foreignKey: "brandId",
  as: "brands",
  onDelete: 'SET NULL',
});

Brand.belongsTo(Statuses, {
  foreignKey: "statusId",
  as: "statuses",
  onDelete: 'SET NULL',
});


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

const aw3Bucket = `${process.env.AWS_BUCKET_NAME}/brands`;

router.delete('/brands/:id', verify,  (req, res, next) => {
  // delete brands
  Brand.findAll({ where: {id: req.params.id}})
  .then((brand) => {
    const brandImage = brand[0].img
    Brand.destroy({
      where: {
        id: brand[0].id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        // console.log(deletedRecord, mapFiles)
        try {
          const params = {
            Bucket: aw3Bucket,
            Key: brandImage,
          }
          s3.deleteObject(params, (err, data) => {})
          res.status(200).json({ message: "Brand successfully deleted" });
        } catch (e) {
          res.status(400).json({ message: "Brand delete, but error on deleting image!", error: e.toString(), req: req.body });
        }
      }
    }, (err) => {
        res.status(500).json({status: false, message: err});
    })
  })
});


router.put('/brands/:id', [verify, upload], (req, res, next) => {
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
    Brand.findAll({ where: {id: bid}}).then((brand) => {
      const paramsDelete = {
        Bucket: aw3Bucket,
        Key: brand.img,
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
  Brand.update(
    dataInsert,
    {
      where: {
        id: bid
      }
    }
  ).then((updated) => {
    let message = "Brand Updated";
    // delete all images first in servers
    res.status(200).json({
      data: updated,
      message: message
    });
  }).catch((err) => {
    res.status(500).json(err)
  })
});

router.post('/brands', [verify, upload], (req, res, next) => {
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

  Brand.create(dataEntry).then((product) => {
    res.status(200).json(product);
  })
})

router.get('/brands/:id', async(req, res, next) => {
    let brand = await Brand.findAll({ where: {id: req.params.id}, include:['statuses']});
    res.json(brand)
});

router.get('/brands', async(req, res, next) => {
  // get products
  let brand = null;
  if (req.query.id) {
    try {
      brand = await Brand.findAll({ where: {id: req.query.id}, include:['statuses']});
      res.status(200).json(brand)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      brand = await Brand.findAll({include:['statuses']});
      res.status(200).json(brand)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router