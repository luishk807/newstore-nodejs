const router = require('express').Router();
const cors = require('cors');
const config = require('../../config.js');

const SweetBoxesProduct = require('../../pg/models/SweetBoxesProducts');

router.all('*', cors());

router.delete('/sweet-boxes-products', (req, res, next) => {
  // delete brands
  client.query('SELECT * FROM sweet_boxes_products where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send({status: false, message: err});
      }
      res.status(200).json(result.rows);
  });
});

router.get('/sweet-boxes-products', async(req, res, next) => {
  SweetBoxesProduct.findAll({ include: ['SweetBoxesProductProduct', 'sweetboxProductStatus']}).then((pimage) => {
      res.status(200).json(pimages);
    }).catch((err) => {
      res.send({status: false, message: err})
    })
});

module.exports = router