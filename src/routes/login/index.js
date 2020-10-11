const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
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

router.post('/login', upload, (req, res, next) => {
  const body = req.body;

  if (body.email) {
    try {

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(body.password, salt, (err, hash) => {
            User.findAll({ where: {email: body.email},include:['user_addresses']}).then((user) => {
              console.log(user[0].dataValues.email)
              // bcrypt.compare(hash, user.password, function(err, res) {
              // })
            }).catch((err)=>{
              console.log("error findint")
            })
        });
          
        // console.log
        // bcrypt.compare(body.password, user.password, function(err, res) {
        //     // res == true
        //     console.log(res);
        // });

      })
      res.status(200).json(user)
    } catch(err) {
      res.status(500).json(err)
    }
  } else {
      res.status(500).json({data:false, message: 'email required'})
  }
})

module.exports = router