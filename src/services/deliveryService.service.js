const DeliveryService = require('../pg/models/DeliveryServices');
const includes = ['deliveryServiceStatus'];
const { Op } = require('sequelize');
const { TRASHED_STATUS } = require('../constants');

const createDeliveryService = async(obj) => {
  return await DeliveryService.create({
    'name': obj.name,
    'description': obj.description
  })
}

const saveDeliveryService = async(obj, id) => {
  DeliveryService.update(
    {
      'name': obj.name,
      'status': obj.status,
      'description': obj.description
    },
    {
      where: {
        id: id
      }
    }
  ).then((updated) => {
    res.status(200).json({
      data: updated,
      status: true,
      message: 'Delivery service Updated'
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
}

const softDeleteDeliveryServiceById = async(id) => {
  return await DeliveryService.update(
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

const deleteDeliveryServiceById = async(id) => {
  return await DeliveryService.destroy({
    where: {
      id: id
    }
  })
}

const getDeliveryServiceById = async(id) => {
    if (id) {
        return await DeliveryService.findOne({ where: { id: id }, include: includes});
    }
    return null;
}

const getDeliveryServices = async() => {
    return await DeliveryService.findAll({include: includes});
}

module.exports = {
    createDeliveryService,
    saveDeliveryService,
    deleteDeliveryServiceById,
    softDeleteDeliveryServiceById,
    getDeliveryServiceById,
    getDeliveryServices
}
