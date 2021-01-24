const Order = require('../pg/models/Orders');

const checkOrderUserId = async(req, bid) => {
  let allow = false;
  if (req.user.type !== 1) {
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


module.exports.checkOrderUserId = checkOrderUserId