const UserWishlist = require('../pg/models/UserWishlists');
const { Op } = require('sequelize');
const includes = ['wishlistProduct','userWishlistUser','userWishlistStatus'];

const deleteWishlist = async(id) => {
  const wishlist = await UserWishlist.findOne({ where: {id: id}});
  return await UserWishlist.destroy({ where: {id: wishlist.id }})
}

const deleteUserWishlist = async(req) => {
  const user = req.user.id;
  const wishlist = await UserWishlist.findOne({ where: {user: user, product: req.params.id}})
  return await UserWishlist.destroy({
    where: {
      id: wishlist.id
    }
  });
}

const updateWishlist = async(req, id) => {
  const body = req.body;
  const user = req.user.id;
  return await UserWishlist.update(
    {
      'product': body.product,
      'user': user,
      'status': body.status
    },
    {
      where: {
        id: id
      }
    }
  )
}

const createWishlist = async(req) => {
  const body = req.body;
  const user = req.user.id;
  return await UserWishlist.create({
    'product': body.productId,
    'user': user
  })
}

const getAllWishlist = async() => {
  return await UserWishlist.findAll();
}

const getWishlistById = async(id) => {
 return await UserWishlist.findOne({ where: {id: id}});
}

const getUserWishlistById = async(req) => {
  const user = req.user.id;
  const id = req.query.product;
  return await UserWishlist.findOne({where: {user: user, product: id}});
}

const getAllWishlistByUser = async(user) => {
  return await UserWishlist.findAll({ where: {user: user, productId: { [Op.not]: null }}, include: includes});
} 

module.exports = {
  deleteWishlist,
  updateWishlist,
  createWishlist,
  getWishlistById,
  getAllWishlist,
  deleteUserWishlist,
  getAllWishlistByUser,
  getUserWishlistById
}
