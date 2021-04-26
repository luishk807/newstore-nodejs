const sweetBox = require('../services/sweetBox.service');

module.exports = {
    searchSweetBoxById: sweetBox.searchSweetBoxById,
    searchActiveSweetBoxById: sweetBox.searchActiveSweetBoxById,
    deleteSweetBox: sweetBox.deleteSweetBox,
    saveSweetBox: sweetBox.saveSweetBox,
    createSweetBox: sweetBox.createSweetBox,
    getSweetBoxById: sweetBox.getSweetBoxById,
    getActiveSweetBoxByType: sweetBox.getActiveSweetBoxByType,
    getAllSweetBox: sweetBox.getAllSweetBox,
    getAllActiveSweetBox: sweetBox.getAllActiveSweetBox
}
