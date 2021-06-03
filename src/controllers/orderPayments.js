const orderPayment = require('../services/orderPayment.service');

module.exports = {
    createOrderPayment: orderPayment.createOrderPayment,
    getOrderPaymentById: orderPayment.getOrderPaymentById,
    saveOrderPayment: orderPayment.saveOrderPayment,
    getOrderPaymentByOrderId: orderPayment.getOrderPaymentByOrderId,
    getOrderPayments: orderPayment.getOrderPayments
}
