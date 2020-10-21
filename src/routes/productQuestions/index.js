const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const verify = require('../verifyToken');
const Model = require('../../pg/models/ProductQuestions');
const ProductQuestion = Model.getModel();

router.all('*', cors());

var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  },
})

var upload = multer({ storage: storage }).array('image')

router.delete('/productquestions/:id', verify, (req, res, next) => {
  // delete brands
  ProductQuestion.findOne({ where: {id: req.params.id}})
  .then((comment) => {
    ProductQuestion.destroy({
      where: {
        id: comment.id
      }
    }).then((deletedRecord) => {
      if (deletedRecord) {
        res.status(200).json({ status: true, message: "Answer successfully deleted" });
      } else {
        res.status(400).json({ status: false, message: "Error on deleting Answer!", error: e.toString(), req: req.body });
      }
    }, (err) => {
        res.status(500).json({status: false, message: err});
    })
  })
});


router.put('/productquestions/:id', [verify, upload], (req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  
  ProductQuestion.update(
    {
      'question': body.question,
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
      message: "Question Updated"
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/productquestions', [verify, upload], (req, res, next) => {
  const body = req.body;
  console.log("user", req.user.id)
  ProductQuestion.create({
    'productId': body.product,
    'question': body.question,
    'user': req.user.id
  }).then((data) => {
    res.status(200).json({status: true, data: data, message: 'Success: questions sent'});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/productquestions', async(req, res, next) => {
  // get statuses
  let data = null;
  if (req.query.id) {
    try {
      data = await ProductQuestion.findOne({ where: {id: req.query.id}});
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      data = await ProductQuestion.findAll();
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router