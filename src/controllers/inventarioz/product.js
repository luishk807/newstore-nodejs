const service = require('../../services/inventarioz/product.service')

module.exports = {
    getOptions: service.getOptions,
    saveOptions: service.saveOptions,
    saveOptionsValue: service.saveOptionsValue,
    deleteOption: service.deleteOption
}
