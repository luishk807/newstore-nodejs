const router = require('express').Router();
const cors = require('cors');
const controller = require('../../controllers/stGeorgeBank');

router.all('*', cors());

router.get('/', async(req, res, next) => {
  const body = req.query;
  const signature = await controller.getSignature(body);
  return res.status(200).json(signature);
});

module.exports = router