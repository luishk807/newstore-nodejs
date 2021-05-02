const DeliveryOption = require('../pg/models/DeliveryOptions');
const includes = ['deliveryOptionStatus', 'deliveryOptionDeliveryServiceGroupCost'];
const { Op } = require('sequelize');

const createDeliveryOption = async(obj) => {
  return await DeliveryOption.create({
    'name': obj.name,
    'description': obj.description,
    'total': obj.total
  })
}

const saveDeliveryOption = async(obj, id) => {
  return await DeliveryOption.update(
    {
      'name': obj.name,
      'status': obj.status,
      'description': obj.description,
      'total': obj.total
    },
    {
      where: {
        id: id
      }
    }
  )
}

const deleteDeliveryOptionById = async(id) => {
  return await DeliveryOption.destroy({
    where: {
      id: id
    }
  })
}

const getDeliveryOptionById = async(id) => {
    if (id) {
        return await DeliveryOption.findOne({ where: { id: id }, include: includes});
    }
    return null;
}

const getDeliveryOptions = async() => {
    return await DeliveryOption.findAll({include: includes});
}

module.exports = {
    createDeliveryOption,
    saveDeliveryOption,
    deleteDeliveryOptionById,
    getDeliveryOptionById,
    getDeliveryOptions
}
