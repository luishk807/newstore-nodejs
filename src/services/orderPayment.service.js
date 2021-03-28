const OrderPayment = require('../pg/models/OrderPayments');
const includes = ['orderPaymentPaymentOption', 'orderPaymentStatus'];
const { Op } = require('sequelize');

const createOrderPayment = async (value) => {
  const dataEntry = {
      'paymentOptionId': value.paymentOptionId,
      'name': value.name,
      'grandTotal': value.grandTotal,
      'orderId': value.orderId
  }
  return await OrderPayment.create(dataEntry);
}

const saveOrderPayment = async (value) => {
  const dataEntry = {
      'paymentOptionId': value.paymentOptionId,
      'name': value.name,
      'grandTotal': value.grandTotal
  }
  return await OrderPayment.update(dataEntry);
}

const getOrderPaymentById = async(id) => {
    if (id) {
        return await OrderPayment.findOne({ where: { id: id }, include: includes});
    }
    return null;
}

const getOrderPayments = async() => {
    return await OrderPayment.findAll({include: includes});
}

const getOrderPaymentByOrderId = async(id) => {
    if (id) {
        return await OrderPayment.findAll({ where: { orderId: id }, include: includes});
    }
    return null;
}

module.exports = {
    createOrderPayment,
    getOrderPaymentById,
    saveOrderPayment,
    getOrderPayments,
    getOrderPaymentByOrderId
}
