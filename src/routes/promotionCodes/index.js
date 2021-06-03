const router = require('express').Router();
const cors = require('cors');
const verifyAdmin = require('../../middlewares/verifyTokenAdmin');
const PromotionCode = require('../../pg/models/PromotionCodes');
const controller = require('../../controllers/promotionCodes');
const parser = require('../../middlewares/multerParser');
router.all('*', cors());

router.delete('/:id', verifyAdmin, async(req, res, next) => {
  // delete brands
  try {
    const promotion = await controller.deletePromotionCode(req.params.id);
    if (promotion) {
      res.status(200).json({ status: true, message: "Promotion successfully deleted" });
    } else {
      res.status(400).json({ status: false, message: "Error on deleting promotion!", error: e.toString(), req: req.body });
    }
  } catch(err) {
    res.status(500).send({status: false, message: err})
  }

});

router.put('/:id', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const promotion = await controller.updatePromotionCode(req);
    if (promotion) {
      res.status(200).json({
        status: true,
        message: 'Promotion created',
        data: promotion
      })
    } else {
      res.status(400).json({
        status: false,
        message: 'Error saving promomtion, please try again',
        data: promotion
      })
    }

  } catch(err) {
    res.status(500).send({status: false, message: err})
  }
});

router.post('/', [verifyAdmin, parser.none()], async(req, res, next) => {
  try {
    const promotion = await controller.createPromotionCode(req.body);
    res.status(200).json({
      status: true,
      message: 'Promotion created',
      data: promotion
    })
  } catch(err) {
    res.status(500).send({status: false, message: err})
  }
});


router.get('/filters/bulk', [verifyAdmin, parser.none()], async(req, res, next) => {
  // get promotions
  try {
    const promotion = await controller.getPromotionCodeByIds(req.query.ids);
    res.status(200).json(promotion)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

router.get('/promo/search', [parser.none()], async(req, res, next) => {
  if (req.query.code) {
    try {
      const promotion = await controller.getPromotionCodeByCode(req.query.code);
      res.status(200).json(promotion)
    } catch(err) {
      res.status(500).json({status: false, message: err})
    }
  }
});

router.get('/:id', [verifyAdmin, parser.none()], async(req, res, next) => {
  const product = await controller.getPromotionCodeById(req.params.id);
  res.json(product)
});


router.get('/', [verifyAdmin, parser.none()], async(req, res, next) => {
  let promotion = null;
  try {
    promotion = await controller.getPromotionCodes();
    res.status(200).json(promotion)
  } catch(err) {
    res.status(500).json({status: false, message: err})
  }
});

module.exports = router
