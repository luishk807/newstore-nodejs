const router = require('express').Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../pg/models/Users');
const { cleanData } = require('../../utils');
const upload = require('../../middlewares/uploadSingle');

router.all('*', cors());

router.post('/', upload, async(req, res, next) => {
  const body = req.body;

  if (body.email) {
    try {
      const newEmail = cleanData(body.email)
      console.log('new text', newEmail)
      const user = await User.findOne({ where: {email: body.email}, include: ['useStatus']});
      
      if (!user) {
        return res.status(200).json({status:false, message: 'user not found'})
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
