const service = require('../../services/inventarioz/client.service');

module.exports = {
    searchClient: service.searchClient,
    saveClient: service.saveClient,
    getClient: service.getClient
}
