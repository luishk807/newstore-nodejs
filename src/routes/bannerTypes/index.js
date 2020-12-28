const router = require('express').Router();
const cors = require('cors');
const BannerType = require('../../pg/models/BannerTypes');

router.all('*', cors());

router.get('/:id', async(req, res, next) => {
    let bannerType = await BannerType.findOne({ where: {id: req.params.id}, include: ['bannerTypeStatus']});
    res.json(bannerType)
});

router.get('/', async(req, res, next) => {
  // get statuses
  let bannerType = null;
  if (req.query.id) {
    try { 
      bannerType = await BannerType.findOne({ where: {id: req.query.id}, include: ['bannerTypeStatus']});
      res.json(bannerType)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      bannerType = await BannerType.findAll();
      res.json(bannerType)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router