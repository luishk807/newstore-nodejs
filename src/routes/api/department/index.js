const router = require('express').Router();
const cors = require('cors');
const controller = require('../../../controllers/inventarioz/department');

router.all('*', cors());

router.get('/', async(req, res) => {
    const result = await controller.getDepartments();
    if (!result.error) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
})

router.post('/', async(req, res) => {
    const result = await controller.saveDepartment(req.body);
    return res.status(200).json(result);
})

module.exports = router
