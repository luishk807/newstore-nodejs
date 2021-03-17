const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const Color = require('../../pg/models/Colors');
const parser = require('../../middlewares/multerParser');
const service = require('../../services/color.service');
const uuid = require('uuid');
const config = require('../../config');
const includes = ['colorStatus'];

router.all('*', cors());

router.delete('/:id', verify,  (req, res, next) => {
  // delete color
  Color.findAll({ where: {id: req.params.id}})
  .then((color) => {
    Color.destroy({
      where: {
        id: color[0].id
      }
    }).then((deletedRecord) => {
      res.status(200).json({status: true, message: "Color successfully deleted" });
    }, (err) => {
      res.status(500).json({status: false, message: err});
    })
  })
});


router.put('/:id', [verify, parser.none()], (req, res, next) => {
  let dataInsert = null;
  const body = req.body;
  const bid = req.params.id;

  dataInsert = {
    'color': body.color,
    'name': body.name,
    'status': body.status,
  }

  Color.update(
    dataInsert,
    {
      where: {
        id: bid
      }
    }
  ).then((updated) => {
    let message = "Color Updated";
    // delete all images first in servers
    res.status(200).json({
      status: true,
      data: updated,
      message: message
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/', [verify, parser.none()], (req, res, next) => {
  service.createColor(req.body)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error creating color', error: err});
    });
})

router.get('/product/:product', async(req, res, next) => {
  const color = await Color.findAll({ where: {productId: req.params.product}, include: includes});
  res.json(color)
});

router.get('/:id', async(req, res, next) => {
  service.getColorById(req.params.id)
    .then(color => {
      res.status(200).json(color);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error getting color', error: err })
    })
});

router.get('/filters/bulk', async(req, res, next) => {
  // get colors
  try {
    const color = await Color.findAll({ where: { id: { [Op.in]: req.query.ids}}, include: includes});
    res.status(200).json(color)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/', async(req, res, next) => {
  // get colors
  let color = null;
  if (req.query.id) { // Do we need this (/?id=1) also?  We already have the top one /:id. This is duplicated functionality
    try {
      color = await Color.findOne({ where: {id: req.query.id}, include: includes});
      res.status(200).json(color)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  } else {
    try {
      color = await Color.findAll({include: includes});
      res.status(200).json(color)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

module.exports = router