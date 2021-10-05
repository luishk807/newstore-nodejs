const QuickbooksService = require('../../../services/integration/quickbooks.node.service');
const { getCustomerRef, saveCustomerRef } = require('../../../services/integration/quickbooksRef.service');
const { convertUserToCustomer } = require('../../../services/integration/helpers/customer');
const { integrationExists, INTEGRATIONS } = require('../../../services/integration.service');
const log = global.logger;

/**
 * Creates the given customer in Quickbooks and the reference that links the local
 * User with it
 * @param {QuickbooksService} service
 * @param {*} userId
 * @param {*} customer 
 * @returns {{customer, customerRef} | null}
 */
async function createCustomerAndRef(service, userId, customer) {
    try {
        const createdCustomer = await service.createCustomer(customer);
        log.debug('Quickbooks created customer', createdCustomer);
        const customerRef = await saveCustomerRef(userId, createdCustomer.Customer.Id);
        return { customer: createdCustomer.Customer, customerRef: customerRef }
    } catch (error) {
        log.error('Error creating Quickbooks customer or customer reference', customer);
        log.error(error);
        return null;
    }
}

/**
 * Hook for creating customer
 * @param {*} user 
 */
async function createCustomer(user) {
    const exists = await integrationExists(INTEGRATIONS.QUICKBOOKS);
    if (exists) {
        log.info('User create hook', `${user.first_name} ${user.last_name}`);
        const service = new QuickbooksService();
        try {
            await service.init();
            const newCustomer = convertUserToCustomer(user);
            const result = await createCustomerAndRef(service, user.id, newCustomer);
            if (result) {
                const { customer, customerRef } = result;
                log.info('Quickbooks Customer created', { createdCustomer: customer, customerRef });
            } else {
                log.error('Error creating customer in Quickbooks');
            }
        } catch (error) {
            log.error('Error creating customer in Quickbooks', error);
        }
    }
    // {"id":"52","last_name":"Lum","first_name":"Steven","password":"","date_of_birth":"1979-07-13","phone":"12345678","gender":1,"mobile":"88888888","email":"daronglin@gmail.com","userRole":"2","updatedAt":"2021-07-15T03:47:28.045Z","createdAt":"2021-07-15T03:47:28.045Z","img":null,"status":"1"}
}

/**
 * Hook for updating a user
 * @param {id, data} param0
 */
async function updateCustomer({ id, data }) {
    const exists = await integrationExists(INTEGRATIONS.QUICKBOOKS);
    if (exists) {
        const user = data;
        log.info('User update hook', `${user.first_name} ${user.last_name}`);
        const service = new QuickbooksService();
        try {
            await service.init();
            const updateCustomer = convertUserToCustomer(user, id);
            // Get the customer reference from local user to quickbooks customer id
            let customerRef = await getCustomerRef(id);
            let createdCustomer = null;
            if (!customerRef) { // If reference to customer for this user does not exist
                log.info('Reference (CustomerRef) does not exist for the given user to update, will create the customer and its reference', updateCustomer);
                const customerAndRef = await createCustomerAndRef(service, id, updateCustomer);
                log.debug('Created customer and customer reference', customerAndRef);
                createdCustomer = customerAndRef.customer;
                customerRef = customerAndRef.customerRef;
            }
            const retrievedCustomer = await service.getCustomerById(customerRef.external_id);
            if (retrievedCustomer) {
                // Get the sync token and assign it to the outgoing Customer
                updateCustomer.SyncToken = retrievedCustomer.Customer.SyncToken;
                updateCustomer.Id = retrievedCustomer.Customer.Id; // Required for update
                console.log('Going to update this', updateCustomer);
                const updatedCustomer = await service.updateCustomer(updateCustomer);
                log.info('Quickbooks Customer updated', updatedCustomer);
            } else {
                throw Error(`Quickbooks customer with Id: ${customerRef.external_id} does not exist`);
            }
        } catch (error) {
            log.error('Error updating customer in Quickbooks', error);
        }
    }
}

async function deleteCustomer({ id }) {
    const exists = await integrationExists(INTEGRATIONS.QUICKBOOKS);
    if (exists) {
        log.info('User delete hook', id);
        log.warn('deleteCustomer not implemented');
    }
}

module.exports = {
    createCustomer,
    updateCustomer,
    deleteCustomer
}