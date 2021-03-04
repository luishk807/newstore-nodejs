const service = require('../../services/inventarioz/stock.service');

module.exports = {
    addStockEntry: service.addStockEntry,
    getAllStocks: service.getStocks
}