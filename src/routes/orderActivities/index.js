const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const parser = require('../../middlewares/multerParser');
const controller = require('../../controllers/orderActivities');

router.all('*', cors());

router.get('/:id', [verify, parser.none()], async(req, res, next) => {
  try {
    const resp = await controller.getOrderActivityByOrderId(req.params.id, req.user);
    res.status(200).json(resp);
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

module.exports = router
