const deliveryService = require('../services/deliveryService.service');

module.exports = {
    createDeliveryService: deliveryService.createDeliveryService,
    saveDeliveryService: deliveryService.saveDeliveryService,
    deleteDeliveryServiceById: deliveryService.deleteDeliveryServiceById,
    getDeliveryServiceById: deliveryService.getDeliveryServiceById,
    getDeliveryServices: deliveryService.getDeliveryServices
}
