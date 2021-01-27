const service = require('../../services/inventarioz/supplier.service');

module.exports = {
    addSupplier: service.addSupplier,
    getSuppliers: service.getSuppliers,
    getSupplierById: service.getSupplierById
}
