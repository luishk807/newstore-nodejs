const router = require('express').Router();
const cors = require('cors');
const ImageBoxType = require('../../pg/models/ImageBoxTypes');

router.all('*', cors());

router.get('/:id', async(req, res, next) => {
    let imageBoxType = await ImageBoxType.findOne({ where: {id: req.params.id}, include: ['imageBoxTypeStatus']});
    res.json(imageBoxType)
});

router.get('/', async(req, res, next) => {
  // get statuses
  let imageBoxType = null;
  if (req.query.id) {
    try { 
      imageBoxType = await ImageBoxType.findOne({ where: {id: req.query.id}, include: ['imageBoxTypeStatus']});
      res.json(imageBoxType)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      imageBoxType = await ImageBoxType.findAll();
      res.json(imageBoxType)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router