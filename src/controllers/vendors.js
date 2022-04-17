const vendor = require('../services/vendor.service');

module.exports = {
  deleteVendor: vendor.deleteVendor,
  softDeleteVendorById: vendor.softDeleteVendorById,
  updateVendor: vendor.updateVendor,
  createVendor: vendor.createVendor,
  getVendorsByIds: vendor.getVendorsByIds,
  getVendorByUserId: vendor.getVendorByUserId,
  getAllActiveVendors: vendor.getAllActiveVendors,
  getActiveVendorById: vendor.getActiveVendorById,
  getVendorById: vendor.getVendorById,
  getAllVendors: vendor.getAllVendors
}