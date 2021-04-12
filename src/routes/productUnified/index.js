const router = require('express').Router();
const verify = require('../../middlewares/verifyToken');
const cors = require('cors');
const service = require('../../services/productUnified.service');
router.all('*', cors());

router.get('/', [verify], async (req, res) => {
    const { q, limit, page } = req.query;
    if (q) {
        service.searchProductUnified(q, { limit, page })
            .then(results => {
                res.status(200).json(results);
            })
            .catch(error => {
                res.status(500).send({ message: err.message, error: error });
            })
    } else {
        res.status(500).send({ message: 'Invalid request', error: 'Invalid request' });
    }
});
  
module.exports = router;
