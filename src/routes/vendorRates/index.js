const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const verify = require('../verifyToken');
const Model = require('../../pg/models/VendorRates');
const VendorRate = Model.getModel();

const VendorModel = require('../../pg/models/Vendors');
const Vendor = VendorModel.getModel();


VendorRate.belongsTo(Vendor, {
  foreignKey: "vendorId",
  as: 'vendors',
  onDelete: 'CASCADE'
})


router.all('*', cors());

router.delete('/vendorrates/:id', verify, (req, res, next) => {
  // delete brands
  VendorRate.findOne({ where: {id: req.params.id}})
  .then((comment) => {
    VendorRate.destroy({
      where: {
        id: comment.id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        res.status(200).json({ status: true, message: "Rate successfully deleted" });
      } else {
        res.status(400).json({ status: false, message: "Error on deleting Rate!", error: e.toString(), req: req.body });
      }
    }, (err) => {
        res.status(500).json({status: false, message: err});
    })
  })
});


router.put('/vendorrates/:id', [verify], (req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  VendorRate.update(
    {
      'rate': body.rate,
      'title': body.title,
      'comment': body.comment,
      'status': body.status
    },
    {
      where: {
        id: id
      }
    }
  ).then((updated) => {
    res.status(200).json({
      data: updated,
      message: "Rate Updated"
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/vendorrates', [verify], (req, res, next) => {
  const body = req.body;
  VendorRate.create({
    'vendor': body.vendor,
    'title': body.title,
    'comment': body.comment,
    'rate': body.rate,
  }).then((data) => {
    res.status(200).json({status: true, data: data});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/vendorrates', async(req, res, next) => {
  // get statuses
  let data = null;
  if (req.query.id) {
    try {
      data = await VendorRate.findOne({ where: {id: req.query.id}});
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      data = await VendorRate.findAll();
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router