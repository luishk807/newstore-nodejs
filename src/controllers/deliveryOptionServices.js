const deliveryOptionService = require('../services/deliveryOptionService.service');

module.exports = {
    createDeliveryOptionService: deliveryOptionService.createDeliveryOptionService,
    getDeliveryOptionServiceById: deliveryOptionService.getDeliveryOptionServiceById,
    saveDeliveryOptionService: deliveryOptionService.saveDeliveryOptionService,
    deleteDeliveryOptionServiceById: deliveryOptionService.deleteDeliveryOptionServiceById,
    getDeliveryOptionServices: deliveryOptionService.getDeliveryOptionServices,
    getActiveDeliveryOptionServices: deliveryOptionService.getActiveDeliveryOptionServices,
    getDeliveryOptionServiceByDeliveryOptionId: deliveryOptionService.getDeliveryOptionServiceByDeliveryOptionId,
    getActiveDeliveryOptionServiceByDeliveryOptionId: deliveryOptionService.getActiveDeliveryOptionServiceByDeliveryOptionId
}
