const deliveryServiceGroupCost = require('../services/deliveryServiceGroupCost.service');

module.exports = {
    createDeliveryServiceGroupCost: deliveryServiceGroupCost.createDeliveryServiceGroupCost,
    saveDeliveryServiceGroupCost: deliveryServiceGroupCost.saveDeliveryServiceGroupCost,
    deleteDeliveryServiceGroupCostById: deliveryServiceGroupCost.deleteDeliveryServiceGroupCostById,
    getDeliveryServiceGroupCostById: deliveryServiceGroupCost.getDeliveryServiceGroupCostById,
    getDeliveryServiceGroupCosts: deliveryServiceGroupCost.getDeliveryServiceGroupCosts,
    getDeliveryServiceGroupCostByFilter: deliveryServiceGroupCost.getDeliveryServiceGroupCostByFilter,
    getAllDeliveryServiceGroupCostByFilter: deliveryServiceGroupCost.getAllDeliveryServiceGroupCostByFilter
}
