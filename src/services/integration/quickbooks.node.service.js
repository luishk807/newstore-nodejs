const config = require('../../config')
const { getQuickbooksAccessToken, revokeQuickbooksToken } = require('../integration.service');
const { IntegrationService } = require('./integration.service');
const QuickBooks = require('node-quickbooks');
const { getGlobalLogger } = require('../../utils/logger.utils');
const log  = getGlobalLogger();

class QuickbooksNodeService extends IntegrationService {
    #integrationObject = null;
    #qbo = null;

    constructor() {
        super('QuickbooksNodeService');
    }

    /** Initializes with the given integration object or pulls it from database */
    async init(integrationObject = null) {
        this.#integrationObject = await getQuickbooksAccessToken(integrationObject);
        if (this.#integrationObject) {
            const accessJson = JSON.parse(this.#integrationObject.accessJson);
            this.#qbo = new QuickBooks(config.integrations.quickbooks.clientId,
                config.integrations.quickbooks.clientSecret,
                accessJson.access_token,
                false, // no token secret for oAuth 2.0
                this.#integrationObject.realmId,
                (config.integrations.quickbooks.environment === 'sandbox'), // use the sandbox?
                true, // enable debugging?
                config.integrations.quickbooks.apiMinorVersion, // set minorversion, or null for the latest version
                '2.0', //oAuth version
                accessJson.refresh_token);
        } else {
            throw Error('Quickbooks is currently disconnected or tokens are expired, please re-authenticate');
        }
    }

    async getCustomerById(id) {
        const that = this;
        return new Promise(function (resolve, reject) {
            that.#qbo.findCustomers([
                { field: 'Id', value: id }
            ], (e, customers) => {
                console.log('error', e);
                if (e) {
                    reject(null);
                } else {
                    console.log('customers query result', customers);
                    resolve({ Customer: customers[0] })
                }
            })
        })
    }

    async createCustomer(customer) {
        const that = this;
        return new Promise(function (resolve, reject) {
            that.#qbo.createCustomer(customer, (e, persistentCustomer) => {
                if (e) {
                    reject(e);
                } else {
                    resolve({ Customer: persistentCustomer });
                }
            })
        });
    }

    async updateCustomer(customer) {
        return new Promise(function (resolve, reject) {
            this.#qbo.createCustomer(customer, (e, persistentCustomer) => {
                if (e) {
                    reject(e);
                } else {
                    resolve({ Customer: persistentCustomer });
                }
            });
        })
    }

    async createInvoice(invoice) {
        // const url = `${this.baseUrl}/${this.apiVersion}/company/${this.realmId}/invoice?minorversion=${this.minorVersion}`;
        // const authHeader = await this.#getAuthorizationHeader();
        // this.#authHeaderCheck(authHeader);
        // return post(url, invoice, authHeader)
        //     .then(function (result) {
        //         return result.data;
        //     })
        //     .catch(function (error) {
        //         log.error('Error from invoice post', error)
        //         throw error;
        //     })
    }

    async createItem(item) {
        // const url = `${this.baseUrl}/${this.apiVersion}/company/${this.realmId}/item?minorversion=${this.minorVersion}`;
        // const authHeader = await this.#getAuthorizationHeader();
        // this.#authHeaderCheck(authHeader);
        // return post(url, customer, authHeader)
        //     .then(function (result) {
        //         return result.data;
        //     })
        //     .catch(function (error) {
        //         log.error('Error from create item post', error)
        //         throw error;
        //     })
    }

    disconnect() {
        return revokeQuickbooksToken();
    }
}

module.exports = QuickbooksNodeService;
