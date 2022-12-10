const DeliveryOptionService = require('../pg/models/DeliveryOptionServices');
const includes = ['deliveryOptionServiceStatus', 'deliveryOptionServiceDeliveryService', 'deliveryOptionServiceDeliveryOption'];
const { Op } = require('sequelize');
const { TRASHED_STATUS } = require('../constants');

const createDeliveryOptionService = async(obj) => {
  const find = await DeliveryOptionService.findOne({where: {
    'deliveryOptionId': obj.deliveryOption,
    'deliveryServiceId': obj.deliveryService
  }})

  if (!find) {
    return await DeliveryOptionService.create({
      'deliveryOptionId': obj.deliveryOption,
      'deliveryServiceId': obj.deliveryService,
    })
  } else {
    return null;
  }
}

const saveDeliveryOptionService = async(obj, id) => {
  const find = await DeliveryOptionService.findOne({where: {
    'deliveryOptionId': obj.deliveryOption,
    'deliveryServiceId': obj.deliveryService
  }})
  if (!find) {
    return await DeliveryOptionService.update(
      {
        'deliveryOptionId': obj.deliveryOption,
        'deliveryServiceId': obj.deliveryService,
        'statusId': obj.status
      },
      {
        where: {
          id: id
        }
      }
    )
  } else {
    return null;
  }
}

const deleteDeliveryOptionServiceById = async(id) => {
  return await DeliveryOptionService.destroy({
    where: {
      id: id
    }
  })
}

const softDeleteDeliveryOptionServiceById = async(id) => {
  return await DeliveryOptionService.update(
    {
      'statusId': TRASHED_STATUS
    },
    {
      where: {
        id: id
      }
    }
  )
}

const getDeliveryOptionServiceById = async(id) => {
    if (id) {
        return await DeliveryOptionService.findOne({ where: { id: id }, include: includes});
    }
    return null;
}

const getActiveDeliveryOptionServices = async() => {
    return await DeliveryOptionService.findAll({where: {statusId: 1}, include: includes});
}

const getDeliveryOptionServices = async() => {
  return await DeliveryOptionService.findAll({include: includes});
}

const getDeliveryOptionServiceByDeliveryOptionId = async(id) => {
  return await DeliveryOptionService.findAll({where: {deliveryOptionId: id}, include: includes});
}

const getActiveDeliveryOptionServiceByDeliveryOptionId = async(id) => {
  return await DeliveryOptionService.findAll({where: {deliveryOptionId: id, statusId: 1}, include: includes});
}

module.exports = {
    createDeliveryOptionService,
    saveDeliveryOptionService,
    deleteDeliveryOptionServiceById,
    softDeleteDeliveryOptionServiceById,
    getDeliveryOptionServiceById,
    getActiveDeliveryOptionServices,
    getDeliveryOptionServices,
    getDeliveryOptionServiceByDeliveryOptionId,
    getActiveDeliveryOptionServiceByDeliveryOptionId
}
