const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');
const verify = require('../verifyToken');
const Model = require('../../pg/models/ProductAnswers');
const ProductAnswer = Model.getModel();

router.all('*', cors());

router.delete('/productanswers/:id', verify, (req, res, next) => {
  // delete brands
  ProductAnswer.findOne({ where: {id: req.params.id}})
  .then((answer) => {
    ProductAnswer.destroy({
      where: {
        id: answer.id
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


router.put('/productanswers/:id', [verify], (req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  ProductAnswer.update(
    {
      'answer': body.answer,
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
      message: "Answer Updated"
    });
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
});

router.post('/productanswers', [verify], (req, res, next) => {
  const body = req.body;
  ProductAnswer.create({
    'question': body.question,
    'answer': body.answer,
  }).then((answer) => {
    res.status(200).json({status: true, data: answer});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/productanswers', async(req, res, next) => {
  // get statuses
  let userRole = null;
  if (req.query.id) {
    try {
      userRole = await ProductAnswer.findOne({ where: {id: req.query.id}});
      res.json(userRole)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      userRole = await ProductAnswer.findAll();
      res.json(userRole)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router