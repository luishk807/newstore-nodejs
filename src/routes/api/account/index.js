const router = require('express').Router();
const cors = require('cors');
const controller = require('../../../controllers/inventarioz/account');

router.all('*', cors());

router.post('/', async(req, res, next) => {
    const body = req.body;
    const result = await controller.createAccount(body.email, body.password);
    if (!result.error) {
        return res.status(result.code).json(result);
    } else {
        return res.status(500).json(result);
    }
})

module.exports = router
