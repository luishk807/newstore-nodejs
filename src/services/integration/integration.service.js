class IntegrationService {
    constructor(name) {
        this.name = name || 'IntegrationService';
    }

    /** Initializes with the given integration object or pulls it from database */
    async init(integrationObject = null) {
    }

    async refreshAuthentication() {
        throw Error('Not implemented');
    }

    async getCustomerById(id) {
        throw Error('Not implemented');
    }

    async createCustomer(customer) {
        throw Error('Not implemented');
    }

    async updateCustomer(customer) {
        throw Error('Not implemented');
    }

    async createInvoice(invoice) {
        throw Error('Not implemented');
    }

    async createItem(item) {
        throw Error('Not implemented');
    }

    async getPurchaseOrder(id) {
        throw Error('Not implemented');
    }

    async getBill(id) {
        throw Error('Not implemented');
    }

    disconnect() {
        throw Error('Not implemented');
    }
}

module.exports = { IntegrationService }
