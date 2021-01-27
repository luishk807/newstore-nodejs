const router = require('express').Router();
const cors = require('cors');
const controller = require('../../../controllers/inventarioz/stock');
router.all('*', cors());

router.post('/entry', async(req, res) => {
    try {
        const result = await controller.addStockEntry(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router
