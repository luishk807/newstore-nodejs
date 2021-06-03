const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const SweetBoxProduct = require('../../pg/models/SweetBoxProducts');
const parser = require('../../middlewares/multerParser');

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
      product = await SweetBoxProduct.findAll({ where: {sweetBoxId: req.query.sweetbox}, include: ['sweetboxProductStatus']});

      res.json(product)
    } catch(err) {
      res.send(err)
    }
  } else {
    SweetBoxProduct.findAll({include: ['sweetboxProductStatus']}).then((pimage) => {
      res.status(200).json(pimages);
    }).catch((err) => {
      res.send({status: false, message: err})
    })
  }
});

router.post('/:id', [verify, parser.none()], async(req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  if (body.items) {
    const items = JSON.parse(body.items);
    const productAdd = [];

    for(const prodIds of items) {
      productAdd.push({
        product: prodIds.replace(/['"]+/g, ''),
        sweetBoxId: id
      });
    }

    await SweetBoxProduct.destroy({
        where: {
          sweetBoxId: id
        }
    });

    const respAdd = await SweetBoxProduct.bulkCreate(productAdd);
    if (respAdd) {
      res.status(200).json({
        status: true,
        message: 'Items saved'
      });
    } else {
      res.send({status: false, message: respAdd})
    }
  } else {
    res.status(400).json({
      status: false,
      message: 'error saving sweetbox'
    });
  }
})

module.exports = router
