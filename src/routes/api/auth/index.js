const router = require('express').Router();
const cors = require('cors');
const controller = require('../../../controllers/inventarioz/auth');

router.all('*', cors());

router.post('/', async(req, res, next) => {
    const body = req.body;
    const result = await controller.authenticate(body.username, body.password);
    if (!result.status) {
        return res.status(result.code).json(result);
    } else {
        return res.status(200).json(result);
    }
})

module.exports = router
