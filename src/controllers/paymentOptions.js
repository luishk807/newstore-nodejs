const paymentOption = require('../services/paymentOption.service');

module.exports = {
    createPaymentOption: paymentOption.createPaymentOption,
    getPaymentOptionById: paymentOption.getPaymentOptionById,
    getPaymentOptions: paymentOption.getPaymentOptions,
    getActivePaymentOptions: paymentOption.getActivePaymentOptions,
    deletePaymentOptionById: paymentOption.deletePaymentOptionById,
    savePaymentOption: paymentOption.savePaymentOption
}
