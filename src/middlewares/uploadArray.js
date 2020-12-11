const multer = require('multer');

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})
  
const upload = multer({ storage: storage }).array('image')

module.exports = upload;