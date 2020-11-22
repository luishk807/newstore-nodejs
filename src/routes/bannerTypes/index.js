const router = require('express').Router();
const cors = require('cors');
const BannerType = require('../../pg/models/BannerTypes');

router.all('*', cors());

router.get('/bannertypes/:id', async(req, res, next) => {
    let bannerType = await BannerType.findOne({ where: {id: req.params.id}});
    res.json(bannerType)
});

router.get('/bannertypes', async(req, res, next) => {
  // get statuses
  let bannerType = null;
  if (req.query.id) {
    try {
      bannerType = await BannerType.findOne({ where: {id: req.query.id}, include: ['bannerTypeBanner']});
      res.json(bannerType)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      bannerType = await BannerType.findAll({include: ['bannerTypeBanner']});
      res.json(bannerType)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router