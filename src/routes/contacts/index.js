const router = require('express').Router();
const cors = require('cors');
const config = require('../../config');
const parser = require('../../middlewares/multerParser');
const sendgrid = require('../../controllers/sendgrid');
router.all('*', cors());

router.post('/', [parser.none()], async(req, res, next) => {
  const body = req.body;
  const resp = await sendgrid.sendContactEmail(body.email, body.subject, body.message);
  if (resp) {
    res.status(200).json({
      status: true,
      message: 'Email Sent',
    });
  } else {
    res.status(500).json({
      status: false,
      message: 'Unable to send email, please try again later',
    });
  }
});

module.exports = router
