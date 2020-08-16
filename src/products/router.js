const router = require('express').Router();
const config = require('../config.js');
const cors = require('cors');

const data = require('../samples/products.json');

router.all('*', cors());

function getProducts (req, res, next) {
  res.json(data);
}

router.get('/products', getProducts)

module.exports = router