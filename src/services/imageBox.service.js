const ImageBox = require('../pg/models/ImageBoxes');
const ImageBoxImages = require('../pg/models/ImageBoxImages');
const parser = require('../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../config');
const s3 = require('../services/storage.service');
const aw3Bucket = `${config.s3.bucketName}/slideImages`;
const AWS_BUCKET_NAME = config.s3.bucketName;
const includes = ['productImages', 'imageBoxStatus', 'imageBoxImageBoxType'];


const deleteImageBox = async(id) => {
  // delete products
  const getImageBox = await ImageBox.findOne({ where: {id: id}});

  if (getImageBox) {
    await ImageBox.destroy({
      where: {
        id: imageBox.id
      }
    });
    const mapFiles = imageBox.productImages.map(data => {
      return data.img_url;
    })

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
      return { code: 200, status: true, message: "Image box successfully deleted" }
    } catch (e) {
      return { code: 400, status: false, message: "Image box delete, but error on deleting image!" }
    }
  } else {
    return { code: 500, status: false, message: "Unable to delete image" }
  }
}

const searchImageBoxById = async (id) => {
  return await ImageBox.findOne({ where: { id: id}, include: includes});
}

const searchImageBoxByKey = async(key) => {
  return await ImageBox.findOne({ where: { key: key}, include: includes});
}

const searchActiveImageBoxByKey = async(key) => {
  return await ImageBox.findOne({ where: { key: key, status: 1}, include: includes});
}

module.exports = {
  deleteImageBox,
  searchImageBoxById,
  searchImageBoxByKey,
  searchActiveImageBoxByKey
}
