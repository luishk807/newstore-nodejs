const router = require('express').Router();
const cors = require('cors');
const controller = require('../../../controllers/inventarioz/product');

router.all('*', cors());

router.get('/', async(req, res) => {
    const query = {
        q: req.query.q,
        category: req.query.category, // Does not search with this yet
        brand: req.query.brand, // Does not search with this yet
        department: req.query.department // Does not search with this yet
    }
    const result = await controller.searchProduct(query);
    if (!result.error) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
})

router.get('/options', async(req, res) => {
    const result = await controller.getOptions();
    if (!result.error) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
})

router.get('/:id', async(req, res) => {
    const { id } = req.params;
    if (!isNaN(id)) {
        const result = await controller.getProduct(+id);
        if (!result.error) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    }
    return res.status(404).json({ error: 'Product id is invalid', message: 'Product id is invalid'});
})

router.get('/:id/stock', async (req,res) => {
    const { id } = req.params;
    if (!isNaN(id)) {
        const result = await controller.getStock({ product_id: +id });
        if (!result.error) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    }
    return res.status(404).json({ error: 'Product id is invalid', message: 'Product id is invalid'});
})

router.get('/variant/:id/stock', async (req,res) => {
    const { id } = req.params;
    if (!isNaN(id)) {
        const result = await controller.getStock({ product_variant_id: id })
        if (!result.error) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    }
    return res.status(404).json({ error: 'Product id is invalid', message: 'Product id is invalid'});
})

router.post('/options', async(req, res) => {
    const result = await controller.saveOptions(req.body);
    return res.status(200).json(req.body);
})

router.delete('/options', async(req, res) => {
    // const result = await controller.deleteOption(req.body);
    // if (!result.error) {
    //     return res.status(200).json(result);
    // } else {
    //     return res.status(500).json(result);
    // }
    return res.status(200).json({ message: 'Not implemented'})
})

router.delete('/variant/:id', async(req, res) => {
    const { id } = req.params;
    try {
        const result = await controller.deleteProductVariant(+id);
        if (!result.error) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    } catch (error) {
        return res.status(500).json(error)
    }
})

router.post('/options-value', async(req, res) => {
    const result = await controller.saveOptionsValue(req.body);
    if (!result.error) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
})

router.post('/', async (req, res) => {
    const result = await controller.saveProduct(req.body);
    if (!result.error) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
})

module.exports = router
