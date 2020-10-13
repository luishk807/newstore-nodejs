const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authToken = req.headers['authorization'];
  const token = authToken && authToken.split(' ')[1];

  if (!token) {
    return res.status("401").json({data: false, message:'access denied'})
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next()
  } catch(err) {
    req.status('400').json({data: false, message:'invalid token'})
  }
}