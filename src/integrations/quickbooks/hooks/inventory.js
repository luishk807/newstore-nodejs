const QuickbooksService = require('../../../services/integration/quickbooks.node.service');
const quickbooksConfig = require('../../../configs/quickbooks')
const ITEM_TYPE = {
    INVENTORY: 'Inventory',
    SERVICE: 'Service',
    CATEGORY: 'Category',
    NON_INVENTORY: 'NonInventory'
}

function a(product) {
    return {
        Name: product.name,
        QtyOnHand: product.qty,
        IncomeAccountRef: {
            value: quickbooksConfig.incomeAccountRef
        },
        Type: ITEM_TYPE.INVENTORY,
        AssetAccountRef: {
            value: quickbooksConfig.assetAccountRef
        },
        InvStartDate: new Date(),
        ExpenseAccountRef: {
            value: quickbooksConfig.expenseAccountRef
        }
    }
}

function createCategoryItem(name) {
    return {
        Type: ITEM_TYPE.CATEGORY,
        Name: name,
        SubItem: false,
        ParentRef: {
            value: 1 // Item.Id
        }
    }
}

function createProductItem(product, id) {
    return {
        ...id && { Id: id},
        Type: ITEM_TYPE.INVENTORY,
        AssetAccountRef: {
            value: 1 // Account.Id
        },
        QtyOnHand: product.qty,
        Sku: product.sku,
        Name: product.name,
        Description: product.description,
        SalesTaxIncluded: false, // False if tax is not included, optional
        TrackQtyOnHand: true,
        SalesTaxCodeRef: {
            value: quickbooksConfig.salesTaxCodeRef // TaxCode.Id
        },
        Source: 'Avenidaz',
        PurchaseTaxIncluded: false, // Optional
        Taxable: true, // Optional,
        ReorderPoint: 10,
        PurchaseDesc: '', // Optional
        Active: false,
        PurchaseCost: 1.00, // Optional
        UnitPrice: 1.00, // Optional
        // ExpenseAccountRef: { // This will be defaulted if not provided
        //     value: 1 // Account.Id
        // }
        IncomeAccountRef: {
            value: quickbooksConfig.incomeAccountRef
        }
    }
}

async function createInventory() {

}

async function updateInventory() {

}

async function deleteInventory() {

}

module.exports = {
    createInventory,
    updateInventory,
    deleteInventory
}
