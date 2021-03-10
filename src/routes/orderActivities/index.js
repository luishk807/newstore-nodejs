const router = require('express').Router();
const cors = require('cors');
const utils = require('../../controllers/orders');
const verify = require('../../middlewares/verifyToken');
const parser = require('../../middlewares/multerParser');
const OrderActivity = require('../../pg/models/OrderActivities');
const includes = ['orderActivityStatuses', 'orderActivityUser'];

router.all('*', cors());

router.get('/:id', [verify, parser.none()], async(req, res, next) => {
  const id = req.params.id;
  const allow = await utils.checkOrderUserId(req, id);
  if (allow) {
    const orderActivity = await OrderActivity.findAll({ where: {orderId: id}, include: includes});
    res.json(orderActivity)
  }
});

module.exports = router
