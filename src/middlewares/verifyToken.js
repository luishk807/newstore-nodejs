const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function(req, res, next) {
  const authToken = req.headers['authorization'];
  const token = authToken && authToken.split(' ')[1];
  if (!token) {
    return res.status("401").json({status: false, message:'access denied'})
  }

  try {
    const verified = jwt.verify(token, config.authentication.authToken);
    req.user = verified;
    next()
  } catch(err) {
    return res.status(401).json({status: false, message:'invalid token'});
  }
}