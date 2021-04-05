const deliveryServiceCost = require('../services/deliveryServiceCost.service');

module.exports = {
    createDeliveryServiceCost: deliveryServiceCost.createDeliveryServiceCost,
    saveDeliveryServiceCost: deliveryServiceCost.saveDeliveryServiceCost,
    deleteDeliveryServiceCostById: deliveryServiceCost.deleteDeliveryServiceCostById,
    getDeliveryServiceCostById: deliveryServiceCost.getDeliveryServiceCostById,
    getDeliveryServiceCosts: deliveryServiceCost.getDeliveryServiceCosts,
    getDeliveryServiceCostByFilter: deliveryServiceCost.getDeliveryServiceCostByFilter
}
