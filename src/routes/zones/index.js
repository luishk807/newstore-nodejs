const router = require('express').Router();
const cors = require('cors');
const controller = require('../../controllers/zones');

router.all('*', cors());

router.get('/', async(req, res, next) => {
  try {
    const zone = await controller.getZones();
    res.json(zone)
  } catch(err) {
    res.status(500).json({status: false, message: err});
  }
});

module.exports = router