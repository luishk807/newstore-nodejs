const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const controller = require('../../controllers/imageBoxes');
const ImageBox = require('../../pg/models/ImageBoxes');
const ImageBoxImages = require('../../pg/models/ImageBoxImages');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../../config');
const s3 = require('../../services/storage.service');
const aw3Bucket = `${config.s3.bucketName}/slideImages`;
const AWS_BUCKET_NAME = config.s3.bucketName;
const includes = ['productImages', 'imageBoxStatus', 'imageBoxImageBoxType']
router.all('*', cors());

router.delete('/:id', verify, async(req, res, next) => {
  // delete products
  if (req.params.id) {
    const result = await controller.deleteImageBox(req.params.id);
    if (result.status) {
      res.status(200).send(result);
    } else {
      if (result.notFound) {
        res.status(404).send(result);
      }
      res.status(500).send(result);
    }
  }
});

router.get('/:id', async(req, res, next) => {
  try {
    const imageBox = await controller.searchImageBoxById(req.params.id);
    res.json(imageBox)
  } catch(err) {
    res.send(err)
  }
});

router.get('/:key/key', async(req, res, next) => {
  try {
    const imageBox = await controller.searchImageBoxByKey(req.params.key);
    res.json(imageBox)
  } catch(err) {
    res.send(err)
  }
});

router.get('/:key/active/key', async(req, res, next) => {
  try {
    const imageBox = await controller.searchActiveImageBoxByKey(req.params.key);
    res.json(imageBox)
  } catch(err) {
    res.send(err)
  }
});

router.get('/', async(req, res, next) => {
  // get statuses
  let imageBox = null;
  if (req.query.name) {
    try {
      imageBox = await  ImageBox.findOne({ where: {name: req.query.name}, include: includes});
      res.json(imageBox)
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.type) {
    try {
      imageBox = await  ImageBox.findOne({ where: {imageBoxTypeId: req.query.type, status: 1}, include: includes});
      res.json(imageBox)
    } catch(err) {
      res.send(err)
    }
  } else if (req.query.id) {
    try {
      imageBox = await  ImageBox.findOne({ where: {id: req.query.id}, include: includes});
      res.json(imageBox)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      imageBox = await  ImageBox.findAll({include: includes});
      res.json(imageBox)
    } catch(err) {
      res.send(err)
    }
  }
});

router.put('/:id', [verify, parser.array('image')], (req, res, next) => {
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
    ImageBox.update(
      {
        'statusId': 2
      }, {
        where: {
          imageBoxTypeId: body.imageBoxType
        }
      }
    ).then(updated => {
      ImageBox.update(
        {
          'name': body.name,
          'imageBoxTypeId': body.imageBoxType,
          'statusId': body.status,
          'key': body.key,
        },{
          where: {
            id: pid
          }
        }
      ).then((updated) => {
        let message = "Image Box Updated";
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
          try{
            ImageBoxImages.destroy({ where: {id: index }})
          } catch (e) {
            console.log(e)
          }
        }
    
        let counter = 1;
        // save all data to product images
        if (imagesUploaded && imagesUploaded.length) {
          let newImages = imagesUploaded.map((data, index) => {
            let imageObj = null;
            if (typeof req.body.imageData === "string") {
              imageObj = JSON.parse(req.body.imageData);
            } else {
              imageObj = JSON.parse(req.body.imageData[index]);
            }
            return {
              'imageBoxId': pid,
              'img_url': data.Key,
              'url': imageObj.url,
              'position': counter++
            }
          })
    
          // save entired bulk to product images
          ImageBoxImages.bulkCreate(newImages).then((images) => {
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
    })
  } else {
    ImageBox.update(
      {
        'name': body.name,
        'imageBoxTypeId': body.imageBoxType,
        'statusId': body.status,
        'key': body.key,
      },{
        where: {
          id: pid
        }
      }
    ).then((updated) => {
      let message = "Image Box Updated";
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
        try{
          ImageBoxImages.destroy({ where: {id: index }})
        } catch (e) {
          console.log(e)
        }
      }
  
      let counter = 1;
      // save all data to product images
      if (imagesUploaded && imagesUploaded.length) {
        let newImages = imagesUploaded.map((data, index) => {
          let imageObj = null;
          if (typeof req.body.imageData === "string") {
            imageObj = JSON.parse(req.body.imageData);
          } else {
            imageObj = JSON.parse(req.body.imageData[index]);
          }
          return {
            'imageBoxId': pid,
            'img_url': data.Key,
            'url': imageObj.url,
            'position': counter++
          }
        })
  
        // save entired bulk to product images
        ImageBoxImages.bulkCreate(newImages).then((images) => {
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
  }
});

router.post('/', [verify, parser.array('image')], (req, res, next) => {
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
  ImageBox.create(
    {
      'name': body.name,
      'imageBoxTypeId': body.imageBoxType,
      'key': body.key,
    }
  ).then((imageBox) => {
    let counter = 1;
    const newImages = imagesUploaded.map((data, index) => {
      let imageObj = null;
      if (typeof req.body.imageData === "string") {
        imageObj = JSON.parse(req.body.imageData);
      } else {
        imageObj = JSON.parse(req.body.imageData[index]);
      }
      return {
        'imageBoxId': imageBox.id,
        'img_url': data.Key,
        'url': imageObj.url,
        'position': counter++
      }
    })
    ImageBoxImages.bulkCreate(newImages).then((images) => {
      res.status(200).json({status: true, message: "Image box added", data: imageBox});
    })
  }).catch(err => {
    res.status(401).json({status: false, message: "Unable to add image box"});
  })
})

module.exports = router