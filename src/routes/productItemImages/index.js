const router = require('express').Router();
const cors = require('cors');
const ProductItemImage = require('../../pg/models/ProductItemImages');

router.all('*', cors());

router.delete('/', (req, res, next) => {
  client.query('SELECT * FROM product_item_images where id = $1', [1], function (err, result) {
      if (err) {
          res.status(400).send({status: false, message: err});
      }
      res.status(200).json(result.rows);
  });
});

router.get('/', async(req, res, next) => {
  ProductItemImage.findAll().then((pimage) => {
      res.status(200).json(pimages);
    }).catch((err) => {
      res.send({status: false, message: err})
    })
});

module.exports = router