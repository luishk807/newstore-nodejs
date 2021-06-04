
const OrderActivity = require('../pg/models/OrderActivities');
const Order = require('../pg/models/Orders');
const includes = ['orderActivityStatuses', 'orderActivityUser'];

const getOrderActivityByOrderId = async (orderId, user) => {
  let order = null;

  if (user && user.type === '1') {
    order = Order.findOne({where: {id: orderId}})
  } else {
    order = Order.findOne({where: {id: orderId, userId: user.id}})
  }

  if (!order) {
    return { code: 500, status: false, message: "Orden invalido" }
  }
  return await OrderActivity.findAll({ where: {orderId: orderId}, order:[['createdAt', 'ASC']], include: includes});
}

module.exports = {
  getOrderActivityByOrderId,
}

