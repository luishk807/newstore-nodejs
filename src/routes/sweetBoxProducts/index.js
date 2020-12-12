const router = require('express').Router();
const cors = require('cors');
const SweetBoxProduct = require('../../pg/models/SweetBoxProducts');

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
  SweetBoxProduct.findAll({include: ['sweetboxProductProduct', 'sweetboxProductStatus']}).then((pimage) => {
      res.status(200).json(pimages);
    }).catch((err) => {
      res.send({status: false, message: err})
    })
});

module.exports = router