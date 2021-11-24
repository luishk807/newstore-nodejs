const OrderProduct = require('../pg/models/OrderProducts');
const config = require('../config');
// const includes = ['orderStatusProduct', 'orderProductItem', 'orderProductBundle', 'orderProductProductDiscount'];
const includes = ['orderStatusProduct', 'orderProductItem', 'orderProductBundle'];
const { Op } = require('sequelize');

const LIMIT = config.defaultLimit;

const deleteOrderProductById = async(id) => {
  // delete order
  const orderProduct = await OrderProduct.findOne({ where: {id: id}});
  return await OrderProduct.destroy({where: {id: orderProduct.id}})
}

const updateOrderProduct = async(req, bid) => {
  const body = req.body;
  return await OrderProduct.update(
    {
      'product': body.productId,
      'quantity': body.quantity,
      'total': body.total,
      'order': body.order,
      'orderStatus': body.orderStatus,
      'name': body.name,
      'unit_total': body.unit_total,
      'description': body.description,
      'model': body.model,
      'code': body.code,
      'category': body.category,
      'brand': body.brand,
      'color': body.color,
      'size': body.size,
      'productDiscount': body.productDiscount
    },
    {
      where: {
        id: bid
      }
    }
  )
}

const createOrderProduct = async (body) => {
  let entry = {
    'product': body.productId,
    'quantity': body.quantity,
    'total': body.total,
    'order': body.order,
    'orderStatus': body.orderStatus,
    'name': body.name,
    'unit_total': body.unit_total,
    'description': body.description,
    'model': body.model,
    'code': body.code,
    'category': body.category,
    'brand': body.brand,
    'color': body.color,
    'size': body.size,
    'productDiscount': body.productDiscount
  }
  return await OrderProduct.create(entry)
}

const getOrderProductById = async(req) => {
    return await OrderProduct.findOne({ where: {id: req.params.id, userId: req.user.id}, include: includes})
}

const getAdminOrderProductById = async(req) => {
    return await OrderProduct.findOne({ where: {id: req.params.id}, include: includes});
}

const getOrderProductByIds = async (ids) => {
    return await OrderProduct.findAll({ where: { id: { [Op.in]: ids}}, include: includes});
}

const getOrderProductsByOrderId = async(id) => {
    return await OrderProduct.findAll({ where: {orderId: id}, include: includes});
}

module.exports = {
  deleteOrderProductById,
  updateOrderProduct,
  createOrderProduct,
  getOrderProductById,
  getAdminOrderProductById,
  getOrderProductByIds,
  getOrderProductsByOrderId
}