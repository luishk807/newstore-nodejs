const order = require('../services/order.service');

module.exports = {
  saveStatusOrder: order.saveStatusOrder,
  getOrder: order.getOrder,
  deleteOrderById: order.deleteOrderById,
  updateOrder: order.updateOrder,
  updateAdminOrder: order.updateAdminOrder,
  cancelOrder: order.cancelOrder,
  getOrderByOrderNumberEmail: order.getOrderByOrderNumberEmail,
  getOrderByUser: order.getOrderByUser,
  getAllOrder: order.getAllOrder,
  createOrder: order.createOrder,
  getOrderById: order.getOrderById,
  getMyOrders: order.getMyOrders,
  getAllOrderWithFilter: order.getAllOrderWithFilter
}
