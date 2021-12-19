
const User = require('../pg/models/Users');
const bcrypt = require('bcryptjs');
const s3 = require('../services/storage.service');
const config = require('../config');
const uuid = require('uuid');
const aw3Bucket = `${config.s3.bucketName}/users`;
const includes = ['useStatus','userRoles', 'userAddresses'];
const { Op } = require('sequelize');
const { callHook } = require('../utils/hooks');
const HOOKNAMES = require('../constants/hooknames');
const { getGlobalLogger } = require('../utils/logger.utils');
const logger  = getGlobalLogger();

const sendToHook = async (eventName, params) => {
    try {
        logger.info(`Calling hooks for ${HOOKNAMES.USER}:${eventName}`);
        callHook(HOOKNAMES.USER, eventName, params);
    } catch (error) {
        logger.error(error);
    }
}

const deleteById = async (id) => {
    const user = await User.findOne({ where: { id: id } });
    if (user) {
        const userImage = user.img;
        const deletedUser = await User.destroy({ where: { id: user.id } });
        sendToHook('delete', { id: user.id });
        if (deletedUser) {
            const result = await deleteFromStorage(userImage);
            if (result.status) {
                return { status: true, message: "User successfully deleted" };
            } else {
                return { status: true, message: "User deleted, but error on deleting image!" }
            }
        }
    }
    return { status: false, message: "User does not exist", notFound: true };
}

const deleteFromStorage = async (fileKey) => {
    if (fileKey) {
        try {
            await s3.deleteObject({ Bucket: aw3Bucket, Key: fileKey });
            return { status: true };
        } catch (err) {
            return { status: false, message: "Error on deleting image", error: err.toString() }
        }
    }
    return { status: false, message: "No file key has been provided to delete from storage" }
}

const findById = async(id) => {
    return await User.findOne({
      where:{
        id: id
      },
      attributes: [
        'first_name',
        'last_name',
        'email',
        'mobile',
        'userRole',
        'phone',
        'img',
        'status',
        'gender',
      ],
      include: includes
    });
}

const getAllUsers = async(req) => {
  let query = {}
  if (req.user) {
    query = {
      where: {
        id: { 
          [Op.ne]: req.user.id 
        } // This does not work
      },
      include: includes,
    };
  } else {
    query = {
      include: includes
    };
  }

  query['order'] = [
    ['createdAt', 'DESC'],
    ['updatedAt', 'DESC'],
  ]
  query['attributes'] = [
    'first_name',
    'id',
    'last_name',
    'email',
    'createdAt',
    'status'
  ]

  return await User.findAll(query)
}

const update = async(body, id, file, isAdmin = false) => {
    let dataInsert = null;
  
    const partBodySaved = body.saved ? JSON.parse(body.saved) : [];
  
      // delete current image
    if (partBodySaved[0] || file) {
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
    if (file) {
      let myFile = file.originalname.split('.');
      const fileType = myFile[myFile.length - 1];
      const fileName = `${uuid.v4()}.${fileType}`;
      const params = {
        Bucket: aw3Bucket,
        Key: fileName,
        Body: file.buffer,
      }
    
      s3.upload(params, (err, data) => {})
  
      dataInsert = {
        'last_name': body.last_name,
        'first_name': body.first_name,
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
    sendToHook('update', { id, data: dataInsert });
    return User.update(
      dataInsert,
      {
        where: {
          id: id
        }
      }
    )
}

const create = async (user, file, isAdmin = false) => {
    const count = await User.count({ where: { email: user.email } } );
    if (count) {
        return { status: false, message: 'Email already registered' };
    } else {
        const hash = await bcrypt.hash(user.password, 10);
        
        let userRole = user.userRole ? user.userRole : 2;
        
        if (!isAdmin) {
            userRole = 2;
        }

        
        const dataEntry = {
            last_name: user.last_name,
            first_name: user.first_name,
            password: hash,
            phone: user.phone,
            gender: user.gender,
            mobile: user.mobile,
            email: user.email,
            userRole: userRole
        }

        let fileName = null;
        if (file) {
            const myFile = file.originalname.split('.');
            const fileType = myFile[myFile.length - 1];
            fileName = `${uuid.v4()}.${fileType}`;
          
            try {
                await s3.upload({ Bucket: aw3Bucket, Key: fileName, Body: file.buffer });
                dataEntry.img = fileName;
            } catch (err) {
                logger.error("Error uploading image", err);
                return { status: false, message: "Error uploading image" };
            }
        }

        try {
            const user = await User.create(dataEntry);
            try {
              const plainUser = user.get({ plain: true });
              sendToHook('create', { ...plainUser, password: null }); // Send to hook without password
            } catch (error) {
              logger.error('Error during sendToHook for user create event');
            }
            return user;
        } catch (err) {
            logger.error("Error creating user", err);
            // Deleting the previously uploaded/stored file because of user creation failure
            const result = await deleteFromStorage(fileName);
            if (!result.status) {
                logger.error(`Error deleting ${fileName} from storage`, result);
            }
            return { status: false, message: "Error creating user", error: err };
        }
    }
}

module.exports = {
    findById,
    getAllUsers,
    deleteById,
    create,
    update
}
