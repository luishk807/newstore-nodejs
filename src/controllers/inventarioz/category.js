const service = require('../../services/inventarioz/category.service')

module.exports = {
    getCategories: service.getCategories,
    saveCategory: service.saveCategory
}
