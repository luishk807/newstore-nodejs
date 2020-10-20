const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require('../../config.js');
const bcrypt = require('bcryptjs');
const Model = require('../../pg/models/Users');
const UserAddressModel = require('../../pg/models/UserAddresses');

const AWS = require('aws-sdk');
const uuid = require('uuid');

const { cleanData } = require('../../utils');

const User = Model.getModel();
const UserAddress = UserAddressModel.getModel();

router.all('*', cors());

var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})

var upload = multer({ storage: storage }).single('image')

router.post('/adminlogin', upload, async(req, res, next) => {
  const body = req.body;
  const cleandata = cleanData(body.email);
  if (cleandata) {
    try {
      
      const user = await User.findOne({ where: {email: cleandata}});
      
      if (!user) {
        return res.status(401).json({status:false, message: 'user not found'})
      }
      
      if (user.dataValues.userRole != 1) {
        return res.status(401).json({status: false, message: "Only Admins allowed"});
      }

      const validate = await bcrypt.compare(body.password, user.dataValues.password);

      if (!validate) {
        return res.status(401).json({status: false, message: "Invalid user credentials"});
      }

       const token = jwt.sign({id: user.id}, process.env.TOKEN_SECRET)
       
      res.status(200).json({status: true, message: "Login successful", user: user, authorization: token})

    } catch(err) {
      return res.status(500).json({status: false, message: "Unable to find user"})
    }
  } else {
      return res.status(500).json({status:false, message: 'email required'})
  }
})

module.exports = router