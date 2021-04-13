const router = require('express').Router();
const cors = require('cors');
const controller = require('../../controllers/login');

router.all('*', cors());

router.post('/', async(req, res, next) => {
  const body = req.body;
  const result = await controller.authenticate(body.email, body.password);
  if (!result.status) {
    return res.status(result.code).json(result);
  } else {
    return res.status(200).json(result);
  }
});

router.post('/reset/password', async(req, res, next) => {
  const body = req.body;
  try {
    const result = await controller.resetPassword(req);    
    if (result) {
      res.status(200).json({status: true, message: "Contraseña actualizada" })
    } else {
      res.status(400).json({status: false, message: "No se pudo actualizar su contraseña, favor de intentar mas tarde" })
    }
  } catch(err) {
    res.send(err)
  }
});

router.post('/reset/request/password', async(req, res, next) => {
  const body = req.body;
  try {
    const result = await controller.requestPasswordReset(req, body.email);    
    if (result) {
      res.status(200).json({status: true, message: "Solicitud enviado" })
    } else {
      res.status(400).json({status: false, message: "No se pudo enviar la solicitud, favor de intentar mas tarde" })
    }
  } catch(err) {
    res.send(err)
  }
});

module.exports = router
