const service = require('../../services/inventarioz/brand.service')

module.exports = {
    getBrands: service.getBrands,
    saveBrand: service.saveBrand
}
