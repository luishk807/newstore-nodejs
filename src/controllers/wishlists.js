const service = require('../services/wishlist.service');

module.exports = {
  deleteWishlist: service.deleteWishlist,
  updateWishlist: service.updateWishlist,
  createWishlist: service.createWishlist,
  getWishlistById: service.getWishlistById,
  getAllWishlist: service.getAllWishlist,
  deleteUserWishlist: service.deleteUserWishlist,
  softDeleteUserWishlist: service.softDeleteUserWishlist,
  getAllWishlistByUser: service.getAllWishlistByUser,
  getUserWishlistById: service.getUserWishlistById
}