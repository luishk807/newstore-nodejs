const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const DeliveryOption = require('../../pg/models/DeliveryOptions');
const parser = require('../../middlewares/multerParser');
const uuid = require('uuid');
const config = require('../../config');
const s3 = require('../../services/storage.service');
const includes = ['deliveryOptionStatus'];

router.all('*', cors());

router.delete('/:id', verify,  (req, res, next) => {
  // delete delivery
  DeliveryOption.findAll({ where: {id: req.params.id}})
  .then((delivery) => {
    DeliveryOption.destroy({
      where: {
        id: delivery[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({ status: deletedRecord, message: "Delivery option successfully deleted" });
    }, (err) => {
      res.status(500).json({status: false, message: err});
    })
  })
});

router.put('/:id', [verify, parser.none()], (req, res, next) => {
  const body = req.body;
  const bid = req.params.id;
  
  DeliveryOption.update(
    {
      'name': body.name,
      'status': body.status,
      'description': body.description,
      'total': body.total
    },
    {
      where: {
        id: bid
      }
    }
  ).then((updated) => {
    res.status(200).json({
      data: updated,
      message: 'Delivery option Updated'
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [verify, parser.none()], (req, res, next) => {
  const body = req.body;
  DeliveryOption.create({
    'name': body.name,
    'description': body.description,
    'total': body.total
  }).then((delivery) => {
    res.status(200).json(delivery);
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/:id', async(req, res, next) => {
    const delivery = await DeliveryOption.findAll({ where: {id: req.params.id, statusId: 1}, include: includes});
    res.json(delivery)
});

router.get('/', async(req, res, next) => {
  // get products
  let delivery = null;
  if (req.query.id) {
    try {
      delivery = await DeliveryOption.findOne({ where: {id: req.query.id, statusId: 1}, include: includes});
      res.status(200).json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      delivery = await DeliveryOption.findAll({where: {statusId: 1}, include: includes});
      res.status(200).json(delivery)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router