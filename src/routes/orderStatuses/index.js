const router = require('express').Router();
const cors = require('cors');
const OrderStatus = require('../../pg/models/OrderStatuses');
const { Op } = require('sequelize');

router.all('*', cors());

router.get('/:id', async(req, res, next) => {
    let st = await OrderStatus.findAll({ where: {id: req.params.id}});
    res.json(st)
});

router.get('/', async(req, res, next) => {
  // get orlder status
  let st = null;
  if (req.query.id) {
    try {
      st = await OrderStatus.findAll({ where: {id: req.query.id}});
      res.json(st)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      st = await OrderStatus.findAll({where: { 
          onlyAdmin: {
            [Op.not]: true
          }
      }});
      res.json(st)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router