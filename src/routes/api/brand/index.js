const router = require('express').Router();
const cors = require('cors');
const controller = require('../../../controllers/inventarioz/brand');

router.all('*', cors());

router.get('/', async(req, res) => {
    const result = await controller.getBrands();
    if (!result.error) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
})

router.post('/', async(req, res) => {
    const result = await controller.saveBrand(req.body);
    return res.status(200).json(result);
})

module.exports = router
