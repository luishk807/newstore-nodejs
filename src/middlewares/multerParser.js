const multer = require('multer');
// Without parameters it will be defaulted to use memory
const multerParser = multer();

module.exports = multerParser;