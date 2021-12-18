const Vendor = require('../pg/models/Vendors');
const { Op } = require('sequelize');
const includes = ['vendor_rates', 'vendorUser','vendorCountry'];
const config = require('../config');
const s3 = require('../services/storage.service');
const uuid = require('uuid');

const aw3Bucket = `${config.s3.bucketName}/vendors`;

const deleteVendor = async(id) => {
  const getVendor = await Vendor.findOne({ where: {id: id}});

  if (getVendor) {
    const vendorImage = getVendor.img
    
    const resp = await Vendor.destroy({
      where: {
        id: getVendor.id
      }
    });

    if (resp) {
        try {
          const params = {
            Bucket: aw3Bucket,
            Key: vendorImage,
          }
          s3.deleteObject(params, (err, data) => {})
          return true;
        } catch (e) {
          return true;
        }
    } else {
      return false;
    }
  }
}

const updateVendor = async(body, file = null, id) => {
  let dataInsert = null;
  const body = req.body;
  const vid = id;

    
  if (file) {
    // insert image
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
        //res.status(500).json(err)
      }
    })

    // delete current image
    const getVendor = await Vendor.findOne({ where: {id: vid}});

    if (getVendor) {
      const paramsDelete = {
        Bucket: aw3Bucket,
        Key: getVendor.img,
      }
      s3.deleteObject(paramsDelete, (err, data) => {
        if (err) {
        //  res.status(500).json(err)
        }
      })
    }

    dataInsert = {
      'name': body.name,
      'user': body.user,
      'description': body.description,
      'position': body.position,
      'email': body.email,
      'zip': body.zip,
      'address': body.address,
      'city': body.city,
      'phone': body.phone,
      'country': body.country,
      'mobile': body.mobile,
      'township': body.township,
      'province': body.province,
      'img':fileName
    }
  } else {
    dataInsert = {
      'name': body.name,
      'description': body.description,
      'user': body.user,
      'zip': body.zip,
      'address': body.address,
      'city': body.city,
      'phone': body.phone,
      'country': body.country,
      'mobile': body.mobile,
      'township': body.township,
      'province': body.province,
      'position': body.position,
      'email': body.email,
    }
  }

  return await Vendor.update(
    dataInsert,
    {
      where: {
        id: vid
      }
    }
  )
}

const createVendor = async(body, file = null) => {
  let dataEntry = null;
  if (file) {
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
    
    dataEntry = {
      'name': body.name,
      'user': body.user,
      'description': body.description,
      'position': body.position,
      'email': body.email,
      'zip': body.zip,
      'address': body.address,
      'city': body.city,
      'phone': body.phone,
      'country': body.country,
      'mobile': body.mobile,
      'township': body.township,
      'province': body.province,
      'img':fileName
    }
  } else {
    dataEntry = {
      'name': body.name,
      'user': body.user,
      'description': body.description,
      'position': body.position,
      'zip': body.zip,
      'address': body.address,
      'city': body.city,
      'phone': body.phone,
      'country': body.country,
      'mobile': body.mobile,
      'township': body.township,
      'province': body.province,
      'email': body.email,
    }
  }

  return await Vendor.create(dataEntry);  
}

const getVendorByUserId = async(userId) => {
  await Vendor.findOne({ where: {user: userId}, include: includes});
}

const getVendorById = async(id) => {
  await Vendor.findOne({ where: {id: id}, include: includes});
}

const getAllActiveVendors = async() => {
  await Vendor.findOne({ where: {status: 1}, include: includes});
}

const getAllVendors = async() => {
  await Vendor.findAll({include: includes});
}

module.exports = {
  deleteVendor,
  updateVendor,
  createVendor,
  getVendorByUserId,
  getVendorById,
  getAllActiveVendors,
  getAllVendors
}
