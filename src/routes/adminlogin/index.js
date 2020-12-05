const router = require('express').Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../pg/models/Users');
const upload = require('../../middlewares/uploadSingle');
const UserAddress = require('../../pg/models/UserAddresses');

const AWS = require('aws-sdk');
const uuid = require('uuid');

const { cleanData } = require('../../utils');

router.all('*', cors());

router.post('/', upload, async(req, res, next) => {
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
