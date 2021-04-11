const Order = require('../pg/models/Orders');
const OrderActivity = require('../pg/models/OrderActivities');

const checkOrderUserId = async(req, bid) => {
  let allow = false;
  if (req.user.type == 1) {
    return true
  } else {
    const confirm = await Order.findOne({
      where: {
        id: bid,
        userId: req.user.id
      }
    })
    if (confirm) {
      allow = true
    }
  }

  return allow;
}

const saveStatusOrder = async(req, bid, status) => {
  const order = await Order.findOne({where: {id: bid}});
  if (order) {
    if (order.orderStatusId !== status) {
      const resp = await OrderActivity.create({
        orderStatusId: status,
        userId: req.user ? req.user.id : null,
        orderId: bid
      });
      return resp
    } else {
      return false;
    }
  } else {
    return false
  }
}

module.exports.checkOrderUserId = checkOrderUserId
module.exports.saveStatusOrder = saveStatusOrder