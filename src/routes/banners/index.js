const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const verify = require('../verifyToken');
const Banner = require('../../pg/models/banners');
const BannerImages = require('../../pg/models/BannerImages');

const AWS = require('aws-sdk');
const uuid = require('uuid');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
})

var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})

var upload = multer({ storage: storage }).array('image')

const aw3Bucket = `${process.env.AWS_BUCKET_NAME}/slideImages`;

router.all('*', cors());

router.delete('/banners/:id', verify, (req, res, next) => {
  // delete products
  Banner.findAll({ where: {id: req.params.id},include:['productImages', 'bannerStatus']})
  .then((banner) => {
    const mapFiles = banner[0].productImages.map(data => {
      return data.img_url;
    })
    Banner.destroy({
      where: {
        id: banner[0].id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        // console.log(deletedRecord, mapFiles)
        try {
          mapFiles.forEach(data => {
            console.log(data)
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: data,
            }
            s3.deleteObject(params, (err, data) => {
              if (err) {
                res.status(500).send({status: false, message: err})
              }
            })
          })
          res.status(200).json({ status: true, message: "Banner successfully deleted" });
        } catch (e) {
          res.status(400).json({ status: false, message: "Banner delete, but error on deleting image!", error: e.toString(), req: req.body });
        }
      }
    }, (err) => {
        res.json(err);
    })
  })
});

router.get('/banners', async(req, res, next) => {
  // get statuses
  let banner = null;
  console.log("query ", req.query)
  if (req.query.id) {
    try {
      banner = await Banner.findOne({ where: {id: req.query.id}, include: ['productImages', 'bannerStatus']});
      res.json(banner)
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.type) {
    try {
      banner = await Banner.findOne({ where: {bannerTypeId: req.query.type, status: 1}, include: ['productImages', 'bannerStatus']});
      res.json(banner)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      banner = await Banner.findAll({include: ['productImages', 'bannerStatus']});
      res.json(banner)
    } catch(err) {
      res.send(err)
    }
  }
});

router.put('/banners/:id', [verify, upload], (req, res, next) => {


  const imagesUploaded = req.files.map((file) => {
    let myFile = file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid.v4()}.${fileType}`;
    const params = {
      Bucket: aw3Bucket,
      Key: fileName,
      Body: file.buffer,
    }

    s3.upload(params, (err, data) => {
      if (err) {
        res.status(500).send({status: false, message: err})
      }
    })

    return {
      Key: fileName
    };
  })

  const body = req.body;
  const pid = req.params.id;

  // if user set main slider active , set the rest to not active
  if (body.status === '1' ) {
    Banner.update(
      {
        'statusId': 2
      },{
        where: {
          bannerTypeId: 1
        }
      }
    )
  }

  Banner.update(
    {
      'name': body.name,
      'bannerTypeId': body.bannerType,
      'statusId': body.status
    },{
      where: {
        id: pid
      }
    }
  ).then((updated) => {
    let message = "Banner Updated";
    // delete all images first in servers
    const partBodySaved = JSON.parse(req.body.saved);
    if (partBodySaved && Object.keys(partBodySaved).length) {
      let mapFiles = []
      let index = []
      Object.keys(partBodySaved).forEach((key) => {
        mapFiles.push(partBodySaved[key].img_url)
        index.push(partBodySaved[key].id)
      })
      
      // delete image selected
      try {
        mapFiles.forEach(data => {
          const params = {
            Bucket: aw3Bucket,
            Key: data,
          }
          s3.deleteObject(params, (err, data) => {
            if (err) {
              res.status(500).send({status: false, message: err})
            }
          })
        })
       // res.status(200).json({ status: true, message: "Product successfully deleted" });
      } catch (e) {
        message += " .Error on deleting image!";
      }


      // delete data from db
      console.log("ids to delete", index)
      try{
        BannerImages.destroy({ where: {id: index }})
      } catch (e) {
        console.log(e)
      }
    }

    let counter = 1;
    // save all data to product images
    if (imagesUploaded && imagesUploaded.length) {
      let newImages = imagesUploaded.map((data) => {
        return {
          'bannerId': pid,
          'img_url': data.Key,
          'position': counter++
        }
      })

      // save entired bulk to product images
      BannerImages.bulkCreate(newImages).then((images) => {
        res.status(200).json({
          status: updated,
          message: message
        });
      })
    } else {
      res.status(200).json({
        status: updated,
        message: message
      });
    }
  })
});

router.post('/banners', [verify, upload], (req, res, next) => {
  // add / update products
  const imagesUploaded = req.files.map((file) => {
    let myFile = file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid.v4()}.${fileType}`;
    const params = {
      Bucket: aw3Bucket,
      Key: fileName,
      Body: file.buffer,
    }

    s3.upload(params, (err, data) => {
      if (err) {
        res.status(500).send(err)
      }
    })

    return {
      Key: fileName
    };
  })

  const body = req.body;
  Banner.create(
    {
      'name': body.name,
      'bannerTypeId': body.bannerType,
    }
  ).then((banner) => {
    let counter = 1;
    const newImages = imagesUploaded.map((data) => {
      return {
        'bannerId': banner.id,
        'img_url': data.Key,
        'position': counter++
      }
    })
    BannerImages.bulkCreate(newImages).then((images) => {
      res.status(200).json({status: true, message: "Banner added", data: banner});
    })
  }).catch(err => {
    res.status(401).json({status: false, message: "Unable to add banner"});
  })
})

module.exports = router