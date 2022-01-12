const service = require('../services/vendor.service');

module.exports = {
  deleteVendor: service.deleteVendor,
  updateVendor: service.updateVendor,
  createVendor: service.createVendor,
  getVendorByUserId: service.getVendorByUserId,
  getAllActiveVendors: service.getAllActiveVendors,
  getVendorById: service.getVendorById,
  getAllVendors: service.getAllVendors
}