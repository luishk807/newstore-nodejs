const router = require('express').Router();
const cors = require('cors');
const verify = require('../verifyToken');
const SweetBoxProduct = require('../../pg/models/SweetBoxProducts');
const upload = require('../../middlewares/uploadSingle');

router.all('*', cors());

router.delete('/', (req, res, next) => {
  // delete brands
  client.query('SELECT * FROM sweet_box_products where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send({status: false, message: err});
      }
      res.status(200).json(result.rows);
  });
});

router.get('/', async(req, res, next) => {
  if (req.query.sweetbox) {
    try {
      product = await SweetBoxProduct.findAll({ where: {sweetBoxId: req.query.sweetbox}, include: ['sweetboxProductProduct', 'sweetboxProductStatus']});

      res.json(product)
    } catch(err) {
      res.send(err)
    }
  } else {
    SweetBoxProduct.findAll({include: ['sweetboxProductProduct', 'sweetboxProductStatus']}).then((pimage) => {
      res.status(200).json(pimages);
    }).catch((err) => {
      res.send({status: false, message: err})
    })
  }
});

router.post('/', [upload, verify], (req, res, next) => {
  const body = req.body;

  if (body.items) {
    const items = body.items.split(',');
    const productAdd = items.map((item) => {
      return {
        productId: item,
        sweetBoxId: body.id
      }
    })
    SweetBoxProduct.destroy({
        where: {
          sweetBoxId: body.id
        }
    }).then((updated) => {
      SweetBoxProduct.bulkCreate(productAdd).then((images) => {
        res.status(200).json({
          status: updated,
          message: message
        });
      }).catch((err) => {
        res.send({status: false, message: err})
      })
    })
  } else {
    res.status(400).json({
      status: false,
      message: 'error saving sweetbox'
    });
  }
})

module.exports = router