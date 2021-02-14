const router = require('express').Router();
const cors = require('cors');
const controller = require('../../../controllers/inventarioz/client');

router.all('*', cors());

router.get('/', async(req, res) => {
    const query = {
        q: req.query.q
    }
    const result = await controller.searchClient(query);
    if (!result.error) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
})

router.get('/:id', async(req, res) => {
    const { id } = req.params;
    if (!isNaN(id)) {
        const result = await controller.getClient(+id);
        if (!result.error) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    }
    return res.status(404).json({ error: 'Client id is invalid', message: 'Client id is invalid'});
})

router.post('/', async (req, res) => {
    const result = await controller.saveClient(req.body);
    if (!result.error) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
})

module.exports = router
