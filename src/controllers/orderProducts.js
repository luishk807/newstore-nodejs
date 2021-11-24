const orderProduct = require('../services/orderProduct.service');

module.exports = {
    deleteOrderProductById: orderProduct.deleteOrderProductById,
    updateOrderProduct: orderProduct.updateOrderProduct,
    createOrderProduct: orderProduct.createOrderProduct,
    getOrderProductById: orderProduct.getOrderProductById,
    getAdminOrderProductById: orderProduct.getAdminOrderProductById,
    getOrderProductByIds: orderProduct.getOrderProductByIds,
    getOrderProductsByOrderId: orderProduct.getOrderProductsByOrderId
}
