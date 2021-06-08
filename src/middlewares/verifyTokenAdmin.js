const jwt = require('jsonwebtoken');
const config = require('../config');
const { getTokenData } = require('../utils');

module.exports = function(req, res, next) {
  const token = getTokenData(req.headers['authorization']);
 
  if (token) {
    if (token && config.adminRoles.includes(+token.type)) {
      req.user = token;
      next()
    } else {
      return res.status(401).json({status: false, message:'access denied'});
    }

  } else {
    return res.status(401).json({status: false, message:'invalid token'});
  }
}