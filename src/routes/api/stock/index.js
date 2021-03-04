const router = require('express').Router();
const cors = require('cors');
const parser = require('../../../middlewares/multerParser');
const controller = require('../../../controllers/inventarioz/stock');
const { processCsvFile } = require('../../../services/inventarioz/file.service');
router.all('*', cors());

router.post('/entry', async(req, res) => {
    try {
        const result = await controller.addStockEntry(req.body);
        return res.status(200).json(result);
    } catch (err) {
        logger.error('Error adding stock entry', err);
        return res.status(500).json(err);
    }
});

router.get('/', async(req, res) => {
    const { skip, take } = req.query
    try {
        const result = await controller.getAllStocks({ skip: +skip, take: +take});
        return res.status(200).json(result);
    } catch (err) {
        logger.error('Error getting stocks', err);
        return res.status(500).json(err);
    }
});

router.post('/import', [parser.single('import')], async(req, res) => {
    if (req.file) {
        const result = processCsvFile(req.file);
    }
    return res.status(200).json({ toasty: 'toasty'})
});

module.exports = router
