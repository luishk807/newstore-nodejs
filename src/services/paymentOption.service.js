const PaymentOption = require('../pg/models/PaymentOptions');
const includes = ['paymentOptionStatus'];
const { Op } = require('sequelize');

const createPaymentOption = async(obj) => {
  return await PaymentOption.create({
    'name': obj.name,
    'description': obj.description,
    'total': obj.total
  })
}

const savePaymentOption = async(obj, id) => {
  PaymentOption.update(
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
  ).then((updated) => {
    res.status(200).json({
      data: updated,
      status: true,
      message: 'Payment option Updated'
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
}

const deletePaymentOptionById = async(id) => {
  return await PaymentOption.destroy({
    where: {
      id: id
    }
  })
}

const getPaymentOptionById = async(id) => {
    if (id) {
        return await PaymentOption.findOne({ where: { id: id }, include: includes});
    }
    return null;
}

const getPaymentOptions = async() => {
    return await PaymentOption.findAll({include: includes});
}

const getActivePaymentOptions = async() => {
  return await PaymentOption.findAll({where: {statusId: 1}, include: includes});
}

module.exports = {
    createPaymentOption,
    savePaymentOption,
    deletePaymentOptionById,
    getPaymentOptionById,
    getPaymentOptions,
    getActivePaymentOptions,
}
