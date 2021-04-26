const imageBox = require('../services/imageBox.service');

module.exports = {
  deleteImageBox: imageBox.deleteImageBox,
  searchImageBoxById: imageBox.searchImageBoxById,
  searchImageBoxByKey: imageBox.searchImageBoxByKey,
  searchActiveImageBoxByKey: imageBox.searchActiveImageBoxByKey,
}
