const brand = require('../services/brand.service');

module.exports = {
  getAllBrands: brand.getAllBrands,
  saveBrands: brand.saveBrands,
  deleteBrandById: brand.deleteBrandById,
  softDeleteBrandById: brand.softDeleteBrandById,
  createBrand: brand.createBrand,
  updateBrandById: brand.updateBrandById,
  getBrandById: brand.getBrandById,
  getActiveBrandById: brand.getActiveBrandById,
  getAllActiveBrandById: brand.getAllActiveBrandById,
  getAllCompleteBrands: brand.getAllCompleteBrands
}