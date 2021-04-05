const deliveryOption = require('../services/deliveryOption.service');

module.exports = {
    createDeliveryOption: deliveryOption.createDeliveryOption,
    getDeliveryOptionById: deliveryOption.getDeliveryOptionById,
    getDeliveryOptions: deliveryOption.getDeliveryOptions,
    saveDeliveryOption: deliveryOption.saveDeliveryOption,
    deleteDeliveryOptionById: deliveryOption.deleteDeliveryOptionById
}
