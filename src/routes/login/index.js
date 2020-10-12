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

const User = Model.getModel();
const UserAddress = UserAddressModel.getModel();

router.all('*', cors());

var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})

var upload = multer({ storage: storage }).single('image')

router.post('/login', upload, async(req, res, next) => {
  const body = req.body;

  if (body.email) {
    try {
      const user = await User.findAll({ where: {email: body.email}});
      
      if (!user) {
        return res.status(200).json({data:false, message: 'user not found'})
      }

      const validate = await bcrypt.compare(body.password, user[0].dataValues.password);

      if (!validate) {
        return res.status(400).json({data: false, message: "Invalid user credentials"});
      }

       const token = jwt.sign({id: user[0].id}, process.env.TOKEN_SECRET)
       
      res.header('auth-token', token).status(200).json({data: true, message: "Login successful"})
      //res.header('auth-token', token).send(token)


      // User.findAll({ where: {email: body.email}}).then((user) => {
      //   if (user.length) {
      //     bcrypt.compare(body.password, user[0].dataValues.password, function(err, response) {
      //         // res == true
      //       if (response) {
      //         const token = jwt.sign({_id: user[0].id}, process.env.TOKEN_SECRET)
      //         res.header('auth-token', token).status(200).json({data: response, message: "Login successful", user: user[0]})
      //       } else {
      //         res.status(200).json({data: response, message: "Invalid user credentials"})
      //       }
      //     })
      //   } else {
      //     res.status(200).json({data:false, message: 'user not found'})
      //   }
      //   // bcrypt.compare(hash, user.password, function(err, res) {
      //   // })
      // }).catch((err)=>{
      //   res.status(200).json({data:false, message: err})
      // })
    } catch(err) {
      return res.status(500).json(err)
    }
  } else {
      return res.status(500).json({data:false, message: 'email required'})
  }

  // if (body.email) {
  //   try {
  //     User.findAll({ where: {email: body.email}}).then((user) => {
  //       if (user.length) {
  //         bcrypt.compare(body.password, user[0].dataValues.password, function(err, response) {
  //             // res == true
  //           if (response) {
  //             const token = jwt.sign({_id: user[0].id}, process.env.TOKEN_SECRET)
  //             res.header('auth-token', token).status(200).json({data: response, message: "Login successful", user: user[0]})
  //           } else {
  //             res.status(200).json({data: response, message: "Invalid user credentials"})
  //           }
  //         })
  //       } else {
  //         res.status(200).json({data:false, message: 'user not found'})
  //       }
  //       // bcrypt.compare(hash, user.password, function(err, res) {
  //       // })
  //     }).catch((err)=>{
  //       res.status(200).json({data:false, message: err})
  //     })
  //   } catch(err) {
  //     res.status(500).json(err)
  //   }
  // } else {
  //     res.status(500).json({data:false, message: 'email required'})
  // }
})

module.exports = router