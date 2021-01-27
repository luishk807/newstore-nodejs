const router = require('express').Router();
const cors = require('cors');
const controller = require('../../../controllers/inventarioz/supplier');

router.all('*', cors());

router.get('/', async(req, res) => {
    const result = await controller.getSuppliers();
    if (!result.error) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
})

router.get('/:id', async(req, res) => {
    const { id } = req.params;
    const result = await controller.getSupplierById(+id);
    if (!result.error) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
})

router.post('/', async(req, res) => {
    try {
        const result = await controller.addSupplier(req.body);
        if (!result.error) {
            return res.status(200).json(result);
        }
        return res.status(500).json(result);
    } catch (err) {
        return res.status(500).json(err);
    }
})

module.exports = router
