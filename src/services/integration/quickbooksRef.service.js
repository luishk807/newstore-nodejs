const QuickbooksRef = require('../../pg/models/integration/QuickbooksRef');
/** Constant types use for defining the type of reference */
const QUICKBOOKS_TYPE = Object.freeze({
    CUSTOMER: 'CUSTOMER',
    INVOICE: 'INVOICE',
    // PURCHASE_ORDER: 'PURCHASE_ORDER'
});

/**
 * Saves a reference for a local id and an external id from Quickbooks with the type
 * @param {string} type Type of Quickbooks object
 * @param {integer} localId Id from a local object
 * @param {integer} externalId Id of the Quickbooks object
 * @returns 
 */
function saveQuickbooksRef(type, localId, externalId) {
    return QuickbooksRef.create({ type: type, local_id: localId, external_id: externalId, created_at: new Date() }, { fields: ['type', 'local_id', 'external_id', 'created_at'], returning: true, plain: true });
}

/**
 * Gets the reference to the Quickbooks object based on the type and id given
 * @param {string} type 
 * @param {intger} localId 
 * @returns Reference to the Quickbooks object
 */
function getQuickbooksRef(type, localId) {
    return QuickbooksRef.findOne({ where: { type: type, local_id: localId } });
}

function saveCustomerRef(userId, customerId) {
    if (userId && customerId) {
        return saveQuickbooksRef(QUICKBOOKS_TYPE.CUSTOMER, userId, customerId);
    } else {
        throw Error('You have to provided a valid user id and customer id in order to store it');
    }
}

function getCustomerRef(userId) {
    if (!userId) {
        throw Error('An user id must be provided');
    }
    return getQuickbooksRef(QUICKBOOKS_TYPE.CUSTOMER, userId);
}

function saveInvoiceRef(orderId, invoiceId) {
    if (orderId && invoiceId) {
        return saveQuickbooksRef(QUICKBOOKS_TYPE.INVOICE, orderId, invoiceId);
    } else {
        throw Error('You have to provided a valid order id and invoice id in order to store it');
    }
}

function getInvoiceRef(orderId) {
    if (!orderId) {
        throw Error('An order id must be provided');
    }
    return getQuickbooksRef(QUICKBOOKS_TYPE.INVOICE, orderId);
}

module.exports = {
    saveCustomerRef,
    getCustomerRef,
    saveInvoiceRef,
    getInvoiceRef
}
