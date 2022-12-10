const DeliveryServiceCost = require('../pg/models/DeliveryServiceCosts');
const includes = ['deliveryServiceCostStatus', 'deliveryServiceCostDeliveryService', 'deliveryServiceCostProvince', 'deliveryServiceCostDistrict', 'deliveryServiceCostCorregimiento', 'deliveryServiceCostZone', 'deliveryServiceCostCountry']
const { Op } = require('sequelize');
const { TRASHED_STATUS } = require('../constants');

const createDeliveryServiceCost = async(obj) => {

  const found = await DeliveryServiceCost.findOne({where: {
    'deliveryServiceId': obj.deliveryService,
    'zoneId': obj.zone,
  }});
  if (found) {
    return {
      status: false,
      message: "duplicate service found",
      data: null
    }
  } else {
    const delivery = await DeliveryServiceCost.create({
      'deliveryServiceId': obj.deliveryService,
      'provinceId': obj.province,
      'districtId': obj.district,
      'zoneId': obj.zone,
      'corregimientoId': obj.corregimiento,
      'countryId': obj.country,
      'amount': obj.amount
    })
    return {
      status: true,
      message: "Delivery service created",
      data: delivery
    }
  }
}

const saveDeliveryServiceCost = async(obj, id) => {
  const found = await DeliveryServiceCost.findOne({
    where: {
    [Op.and]: {
      'deliveryServiceId': obj.deliveryService,
      'zoneId': obj.zone,
    },
    [Op.not]: {
      'id': id
    }
  }});
  if (found) {
    return {
      status: false,
      message: "duplicate service found",
      data: null
    }
  } else {
    const delivery = await DeliveryServiceCost.update({
      'deliveryServiceId': obj.deliveryService,
      'provinceId': obj.province,
      'districtId': obj.district,
      'zoneId': obj.zone,
      'corregimientoId': obj.corregimiento,
      'countryId': obj.country,
      'amount': obj.amount
    },
    {
      where: {
        id: id
      }
    })
    return {
      status: true,
      message: "Delivery service updated",
      data: delivery
    }
  }
}

const deleteDeliveryServiceCostById = async(id) => {
  return await DeliveryServiceCost.destroy({
    where: {
      id: id
    }
  })
}

const softDeleteDeliveryServiceCostById = async(id) => {
  return await DeliveryServiceCost.update(
    {
      'status': TRASHED_STATUS,
    },
    {
      where: {
        id: id
      }
    }
  )
}

const getDeliveryServiceCostById = async(id) => {
    if (id) {
        return await DeliveryServiceCost.findOne({ where: { id: id }, include: includes});
    }
    return null;
}

const getDeliveryServiceCosts = async() => {
    return await DeliveryServiceCost.findAll({include: includes});
}

const getDeliveryServiceCostByFilter = async(filter) => {
  return await DeliveryServiceCost.findOne({ where: filter, include: includes});
}

module.exports = {
    createDeliveryServiceCost,
    saveDeliveryServiceCost,
    deleteDeliveryServiceCostById,
    softDeleteDeliveryServiceCostById,
    getDeliveryServiceCostById,
    getDeliveryServiceCosts,
    getDeliveryServiceCostByFilter
}
