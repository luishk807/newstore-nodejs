const Brand = require('../pg/models/Brands');
const config = require('../config');
const s3 = require('../services/storage.service');
const uuid = require('uuid');
const { TRASHED_STATUS } = require('../constants');
const aw3Bucket = `${config.s3.bucketName}/brands`;
const includes = ['brandStatus'];

const deleteBrandById = async(id) => {
  // delete brands
  const getBrand = await Brand.findOne({ where: {id: id}});

  if (getBrand) {
    const brandImage = getBrand.img

    const brandDeleted = await Brand.destroy({
      where: {
      id: getBrand.id
    }});
    
    if (brandDeleted) {
        if (brandImage) {
            try {
                const params = {
                    Bucket: aw3Bucket,
                    Key: brandImage,
                }
                s3.deleteObject(params, (err, data) => {})
                return {
                    status: true,
                    message: 'Brand successfully deleted'
                }
            } catch (e) {
                return {
                    status: true,
                    message: "Brand delete, but error on deleting image!"
                }
            }
        } else {
            return {
                status: false,
                message: 'brand deleted'
            }
        }
    } else {
        return {
            status: false,
            message: 'Unable to delete brand'
        }
    }
  } else {
        return {
            status: false,
            message: 'Unable to find brand'
        }  
  }
}

const softDeleteBrandById = async(id) => {
  // delete brands
  const getBrand = await Brand.findOne({ where: {id: id}});

  if (getBrand) {
    const brandDeleted = await Brand.update({
        status: TRASHED_STATUS
    }, {
        where: {
          id: getBrand.id
        }
    });
    
    if (brandDeleted) {
        return {
            status: true,
            message: 'Brand successfully deleted'
        }
    } else {
        return {
            status: false,
            message: 'Unable to delete brand'
        }
    }
  } else {
        return {
            status: false,
            message: 'Unable to find brand'
        }  
  }
}

const updateBrandById = async(req) => {
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
      const getBrand = await Brand.findOne({ where: {id: bid}});
      
      if (getBrand) {

        const paramsDelete = {
            Bucket: aw3Bucket,
            Key: brand.img,
        }
        s3.deleteObject(paramsDelete, (err, data) => {
            if (err) {
                //  res.status(500).json(err)
            }
        })

        dataInsert = {
            'name': body.name,
            'status': body.status,
            'img': fileName,
        }
      } else {
          return {
              status: false,
              message: 'Unable to find brand'
          }
      }
    } else {
      dataInsert = {
        'name': body.name,
        'status': body.status,
      }
    }

    const brandUpdate = await Brand.update(      
      dataInsert,
      {
        where: {
          id: bid
        }
      }
    )

    if (brandUpdate) {
        return {
            status: true,
            message: 'Brand updated'
        }
    } else {
        return {
            status: false,
            message: 'Unable to update brand'
        }
    }
}

const createBrand = async(req) => {
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
          return {
            status: 400,
            message: err
          }
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
    const resp = await Brand.create(dataEntry);
    if (resp) {
      return {
        status: 200,
        message: 'Brand created'
      }
    } else {
      return {
        status: 400,
        message: 'Unable to create brand'
      }
    }
}

const getBrandById = async(id) => {
  return await Brand.findOne({ where: {id: id}, include: includes});
}

const getActiveBrandById = async(id) => {
  return await Brand.findOne({ where: {id: id, status: 1}, include: includes});
}

const getAllActiveBrandById = async() => {
  return await Brand.findAll({ where: {status: 1}, include: includes});
}

const getAllCompleteBrands = async() => {
  return await Brand.findAll({ include: includes });
}

const getAllBrands = () => {
    return Brand.findAll({});
}

const createBrandObject = (name, statusId) => {
    return { name, statusId }
}

const saveBrands = (arrayOfBrands) => {
    const brands = [];
    if (!!arrayOfBrands.length) {
        arrayOfBrands.forEach(b => {
            brands.push(createBrandObject(b, 1));
        });
    }
    if (brands.length > 0) {
        return Brand.bulkCreate(brands);
    }
    return Promise.resolve([])
}

module.exports = {
    getAllBrands,
    getBrandById,
    getActiveBrandById,
    getAllActiveBrandById,
    saveBrands,
    deleteBrandById,
    createBrand,
    softDeleteBrandById,
    updateBrandById,
    getAllCompleteBrands
}
