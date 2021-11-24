const { createHook, listenHook } = require('./utils/hooks');
const HOOKNAMES = require('./constants/hooknames');
const { createCustomer, updateCustomer, deleteCustomer } = require('./integrations/quickbooks/hooks/user');
// const { createInvoice, updateInvoice, deleteInvoice } = require('./integrations/quickbooks/hooks/invoice');
// const { createInventory, updateInventory, deleteInventory } = require('./integrations/quickbooks/hooks/inventory');

/**
 * Create the hooks that will be used in the system with the given event names
 */
function createHooks() {
    // Creating hooks that will be used by user creation for the given events
    createHook(HOOKNAMES.USER, ['create', 'update', 'delete']);
    // Creating hooks that will be used for invoices
    // createHook(HOOKNAMES.ORDER, ['create', 'update', 'delete']);
    // Creating hooks that will be used for stock updates
    // createHook(HOOKNAMES.INVENTORY, ['create', 'update', 'delete']);
}

function listenUserHooks() {
    // Assign hooks for the given event and Hook name
    listenHook(HOOKNAMES.USER, 'create', createCustomer);
    listenHook(HOOKNAMES.USER, 'update', updateCustomer);
    listenHook(HOOKNAMES.USER, 'delete', deleteCustomer);
}

// function listenOrderHooks() {
//     listenHook(HOOKNAMES.ORDER, 'create', createInvoice);
//     listenHook(HOOKNAMES.ORDER, 'update', updateInvoice);
//     listenHook(HOOKNAMES.ORDER, 'delete', deleteInvoice);
// }

// function listenInventoryHooks() {
//     listenHook(HOOKNAMES.INVENTORY, 'create', createInventory);
//     listenHook(HOOKNAMES.INVENTORY, 'update', updateInventory);
//     listenHook(HOOKNAMES.INVENTORY, 'delete', updateInventory);
// }

/**
 * Sets up the hook names and the listeners
 */
function configureHooks() {
    createHooks();
    listenUserHooks();
    // listenInventoryHooks();
    // listenOrderHooks();
}

module.exports = configureHooks;
