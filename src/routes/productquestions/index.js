const router = require('express').Router();
const cors = require('cors');
const verify = require('../verifyToken');
const ProductQuestion = require('../../pg/models/ProductQuestions');
const upload = require('../../middlewares/uploadArray');

router.all('*', cors());

router.delete('/:id', verify, (req, res, next) => {
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


router.put('/:id', [verify, upload], (req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  
  ProductQuestion.update(
    {
      'question': body.question,
      'status': body.status,
      'user': req.user.id,
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

router.post('/', [verify, upload], (req, res, next) => {
  const body = req.body;
  ProductQuestion.create({
    'product': body.product,
    'question': body.question,
    'user': req.user.id,
  }).then((data) => {
    res.status(200).json({status: true, data: data, message: 'Success: questions sent'});
  }).catch((err) => {
    res.status(500).json({status: false, message: err})
  })
})

router.get('/', async(req, res, next) => {
  // get statuses
  let data = null;

  const limit = req.query.limit ? req.query.limit : 5;

  if (req.query.id) {
    try {
      data = await ProductQuestion.findOne({ where: {id: req.query.id}, include:['questionAnswers', 'questionUser']});
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  } else {
    try {
      data = await ProductQuestion.findAll({limit, include:['questionAnswers','questionUser'], order: [['created', 'DESC']]});
      res.json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router