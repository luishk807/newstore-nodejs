const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

const Model = require('../../pg/models/Statuses');
const Status = Model.getModel();

router.all('*', cors());

router.delete('/statuses/:id', (req, res, next) => {
  // delete products
  Status.findAll({ where: {id: req.params.id}})
  .then((status) => {
    Status.destroy({
      where: {
        id: status[0].id
      }
    }).then((deletedRecord) => {
        res.status(200).json({ message: "Status successfully deleted" });
    }, (err) => {
        res.json(err);
    })
  })
});


router.put('/statuses/:id', (req, res, next) => {

  const body = req.body;
  const pid = req.params.id;

  Status.update(
    {
      'name': body.name,
    },{
      where: {
        id: pid
      }
    }
  ).then((updated) => {
    res.status(200).json({ message: "Brand successfully deleted" });
  })
});

router.post('/statuses', (req, res, next) => {
  // add / update statuses
  const body = req.body;

  Status.create(
    {
      'name': body.name,
    }
  ).then((product) => {
    res.status(200).json(product);
  })
})

router.get('/statuses/:id', async(req, res, next) => {
    let product = await Status.findAll({ where: {id: req.params.id}});
    res.json(product)
});

router.get('/statuses', async(req, res, next) => {
  // get statuses
  let product = null;
  if (req.query.id) {
    try {
      product = await Status.findAll({ where: {id: req.query.id}});
      res.json(product)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      product = await Status.findAll();
      res.json(product)
    } catch(err) {
      res.send(err)
    }
  }
});

module.exports = router