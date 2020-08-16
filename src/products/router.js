const router = require('express').Router();
const config = require('../config.js');
const cors = require('cors');

router.all('*', cors());

function getProducts (req, res, next) {
  res.json(["Tony","Lisa","Michael","Ginger","Food"]);
}

router.get('/products', getProducts)

module.exports = router