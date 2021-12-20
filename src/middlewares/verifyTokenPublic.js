const jwt = require('jsonwebtoken');
const config = require('../config');
const { getTokenData } = require('../utils');

module.exports = function(req, res, next) {
  const token = getTokenData(req.headers['authorization']);
  if (token) {
    req.user = token;
  } else {
    req.user = null
  }
  next()
}