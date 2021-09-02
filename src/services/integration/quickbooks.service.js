const config = require('../../config')
const { STATUS } = require('../../constants/integration/index');
const { getQuickbooksAccessToken, getQuickbooksIntegrationStatus, revokeQuickbooksToken } = require('../integration.service');
const { post, get } = require('axios');
const { IntegrationService } = require('./integration.service');
const { getGlobalLogger } = require('../../utils/logger.utils');
const log  = getGlobalLogger();

class QuickbooksService extends IntegrationService {
    constructor() {
        super('QuickbooksService')
        this.realmId = null;
        this.integrationObject = null;

        this.baseUrl = config.integrations.quickbooks.baseUrl;
        this.apiVersion = config.integrations.quickbooks.apiVersion;
        this.minorVersion = config.integrations.quickbooks.apiMinorVersion;
    }

    /** Initializes with the given integration object or pulls it from database */
    async init(integrationObject = null) {
        this.integrationObject = await getQuickbooksAccessToken(integrationObject);
        if (this.integrationObject) {
            this.realmId = this.integrationObject.realmId;
        } else {
            throw Error('Quickbooks is currently disconnected or tokens are expired, please re-authenticate');
        }
    }

    #getToken(accessTokenObject) {
        return accessTokenObject.access_token
    }

    async #getAuthorizationHeader() {
        const token = await this.#getAccessToken();
        if (!token) {
            return null;
        }
        return {
            headers: { Authorization: `Bearer ${this.#getToken(JSON.parse(token.accessJson))}` }
        }
    }

    /** 
     * Returns the access token or refreshed access token or throw if it cannot be refreshed
     * and requires a re-authentication
     */
    async #getAccessToken() {
        const status = await getQuickbooksIntegrationStatus(this.integrationObject, true, false);
        if (status.status === STATUS.CONNECTED) {
            return this.integrationObject;
        }
        // This should refresh
        return getQuickbooksAccessToken(this.integrationObject);
    }

    /** Checks if it's valid and throws */
    #authHeaderCheck(authHeader) {
        if (!authHeader) {
            const error = 'Authorization header is null, needs to re-authenticate Quickbooks';
            log.error(error);
            throw Error(error);
        }
    }

    async getCustomerById(id) {
        const url = `${this.baseUrl}/${this.apiVersion}/company/${this.realmId}/customer/${id}?minorversion=${this.minorVersion}`;
        const authHeader = await this.#getAuthorizationHeader();
        this.#authHeaderCheck(authHeader);
        return get(url, authHeader)
            .then(result => {
                return result.data;
            })
            .catch(function (error) {
                log.error('Error from customer post', error)
                return null;
            })
    }

    async createCustomer(customer) {
        const url = `${this.baseUrl}/${this.apiVersion}/company/${this.realmId}/customer?minorversion=${this.minorVersion}`;
        const authHeader = await this.#getAuthorizationHeader();
        this.#authHeaderCheck(authHeader);
        return post(url, customer, authHeader)
            .then(function (result) {
                return result.data;
            })
            .catch(function (error) {
                log.error('Error from customer post', error)
                throw error;
            })

            // data: {
            //          Customer: {
            //            Taxable: true,
            //            Job: false,
            //            BillWithParent: false,
            //            Balance: 0,
            //            BalanceWithJobs: 0,
            //            CurrencyRef: [Object],
            //            PreferredDeliveryMethod: 'Print',
            //            IsProject: false,
            //            domain: 'QBO',
            //            sparse: false,
            //            Id: '59',
            //            SyncToken: '0',
            //            MetaData: [Object],
            //            Title: 'Mr.',
            //            GivenName: 'Test',
            //            FamilyName: 'Customer',
            //            FullyQualifiedName: 'Test',
            //            DisplayName: 'Test',
            //            PrintOnCheckName: 'Mr. Test Customer',
            //            Active: true,
            //            DefaultTaxCodeRef: [Object]
            //          },
            //          time: '2021-07-10T13:05:41.822-07:00'
            //        }

    }

    async updateCustomer(customer) {
        const url = `${this.baseUrl}/${this.apiVersion}/company/${this.realmId}/customer?minorversion=${this.minorVersion}`;
        if (customer) {
            const authHeader = await this.#getAuthorizationHeader();
            this.#authHeaderCheck(authHeader);
            return post(url, customer, authHeader)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (error) {
                    log.error('Error from update customer post', error)
                    throw error;
                })
        } else {
            throw Error('Cannot update without a provided customer');
        }
    }

    async createInvoice(invoice) {
        const url = `${this.baseUrl}/${this.apiVersion}/company/${this.realmId}/invoice?minorversion=${this.minorVersion}`;
        const authHeader = await this.#getAuthorizationHeader();
        this.#authHeaderCheck(authHeader);
        return post(url, invoice, authHeader)
            .then(function (result) {
                return result.data;
            })
            .catch(function (error) {
                log.error('Error from invoice post', error)
                throw error;
            })
    }

    async createItem(item) {
        const url = `${this.baseUrl}/${this.apiVersion}/company/${this.realmId}/item?minorversion=${this.minorVersion}`;
        const authHeader = await this.#getAuthorizationHeader();
        this.#authHeaderCheck(authHeader);
        return post(url, customer, authHeader)
            .then(function (result) {
                return result.data;
            })
            .catch(function (error) {
                log.error('Error from create item post', error)
                throw error;
            })
    }

    disconnect() {
        return revokeQuickbooksToken();
    }
}

module.exports = QuickbooksService;
