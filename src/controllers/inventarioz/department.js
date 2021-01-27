const service = require('../../services/inventarioz/department.service')

module.exports = {
    getDepartments: service.getDepartments,
    saveDepartment: service.saveDepartment
}
