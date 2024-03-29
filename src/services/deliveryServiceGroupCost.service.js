const DeliveryServiceGroupCost = require('../pg/models/DeliveryServiceGroupCosts');
const includes = ['deliveryServiceGroupCostStatus', 'deliveryServiceGroupCostDeliveryOption']
const { Op } = require('sequelize');
const { TRASHED_STATUS } = require('../constants');

const createDeliveryServiceGroupCost = async(obj) => {

  const found = await DeliveryServiceGroupCost.findOne({where: {
    'deliveryOptionId': obj.deliveryOption,
    'name': obj.name,
  }});
  if (found) {
    return {
      status: false,
      message: "duplicate service found",
      data: null
    }
  } else {
    const delivery = await DeliveryServiceGroupCost.create({
      'deliveryOptionId': obj.deliveryOption,
      'name': obj.name,
      'amount': obj.amount
    })
    return {
      status: true,
      message: "Delivery service created",
      data: delivery
    }
  }
}

const saveDeliveryServiceGroupCost = async(obj, id) => {
  const found = await DeliveryServiceGroupCost.findOne({
    where: {
    [Op.and]: {
      'deliveryOptionId': obj.deliveryOption,
      'name': obj.name,
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
    const delivery = await DeliveryServiceGroupCost.update({
      'deliveryOptionId': obj.deliveryOption,
      'statusId': obj.status,
      'name': obj.name,
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

const deleteDeliveryServiceGroupCostById = async(id) => {
  return await DeliveryServiceGroupCost.destroy({
    where: {
      id: id
    }
  })
}

const softDeleteDeliveryServiceGroupCostById = async(id) => {
  return await DeliveryServiceGroupCost.update(
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

const getDeliveryServiceGroupCostById = async(id) => {
    if (id) {
        return await DeliveryServiceGroupCost.findOne({ where: { id: id }, include: includes});
    }
    return null;
}

const getDeliveryServiceGroupCosts = async() => {
    return await DeliveryServiceGroupCost.findAll({include: includes, orderBy:[
      ['name', 'ASC']
    ]});
}

const getDeliveryServiceGroupCostByFilter = async(filter) => {
  return await DeliveryServiceGroupCost.findOne({ where: filter, include: includes, orderBy:[
    ['name', 'ASC']
  ]});
}

const getAllDeliveryServiceGroupCostByFilter = async(filter) => {
  return await DeliveryServiceGroupCost.findAll({ where: filter, include: includes, orderBy:[
    ['name', 'ASC']
  ]});
}

module.exports = {
    createDeliveryServiceGroupCost,
    saveDeliveryServiceGroupCost,
    deleteDeliveryServiceGroupCostById,
    softDeleteDeliveryServiceGroupCostById,
    getDeliveryServiceGroupCostById,
    getDeliveryServiceGroupCosts,
    getDeliveryServiceGroupCostByFilter,
    getAllDeliveryServiceGroupCostByFilter
}
