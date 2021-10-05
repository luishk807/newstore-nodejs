const sequelize = require('../pg/sequelize');
const { PurchaseOrder, PurchaseOrderItem } = require('../pg/models/PurchaseOrder');
const { getGlobalLogger } = require('../utils/logger.utils');
const logger = getGlobalLogger();

/**
 * Creates an PurchaseOrder object in database with its PurchaseOrderItems in as transaction
 * @param {*} purchaseOrder Purchase order object with items as its purchase order items
 * @returns {*} PurchaseOrder
 */
const createPurchaseOrder = async ({ amount = 0.0, externalId = null, externalJSON = null, referenceName = null, items = [] }) => {
    // Only if there are actually items
    if (items.length > 0) {
        const purchaseOrder = {
            amount: amount,
            external_id: externalId,
            external_json: externalJSON,
            reference_name: referenceName,
            created_at: new Date()
        };

        const purchaseOrderItems = [];
        items.forEach(poi => {
            purchaseOrderItems.push({
                purchase_order_id: null,
                sku: poi.sku,
                qty: poi.qty,
                unit_price: poi.unitPrice,
                amount: poi.amount
            })
        });

        logger.info('Creating PurchaseOrder in database', { ...purchaseOrder, items: items });
        const t = await sequelize.transaction();
        try {
            const newPurchaseOrder = await PurchaseOrder.create(purchaseOrder, {
                transaction: t,
                fields: ['amount', 'external_id', 'external_json', 'reference_name', 'created_at']
            });

            logger.info(`New PurchaseOrder created with id: ${newPurchaseOrder.id}`, newPurchaseOrder.dataValues);
            // Assigning the foreign key to its parent PurchaseOrder
            purchaseOrderItems.forEach(poi => poi.purchase_order_id = newPurchaseOrder.id);

            const newPurchaseOrderItems = await PurchaseOrderItem.bulkCreate(purchaseOrderItems, {
                transaction: t, fields: ['purchase_order_id', 'sku', 'qty', 'unit_price', 'amount'] }
            );

            logger.info(`New PurchaseOrderItems created:`, newPurchaseOrderItems.map(poi => poi.dataValues));
            await t.commit();
            // Flattening the object
            const chewed = newPurchaseOrder.dataValues;
            chewed.purchase_order_items = newPurchaseOrderItems.map(poi => poi.dataValues);
            return chewed;
        } catch (error) {
            logger.error('Error creating PurchaseOrder', error);
            await t.rollback();
        }
    } else {
        logger.warn('Cannot create PurchaseOrder without any items');
    }

    return null;
}

const getPurchaseOrderByQuery = async (query) => {
    try {
        const purchaseOrders = await PurchaseOrder.findAll({ where: query, include: [PurchaseOrderItem] });
        return purchaseOrders;
    } catch (error) {
        logger.error('Error getting by query');
        logger.error(error);
    }
    return []
}

/**
 * Converts Quickbooks integration PurchaseOrder into a local saveable object
 * @param {*} purchaseOrder Quickbooks PurchaseOrder object
 * @param {*} itemSearchFunction QuickbooksService function for getting purchase order items from Quickbooks
 * @returns {*} PurchaseOrder local saveable object
 */
const convertQuickbooksPurchaseOrder = async (purchaseOrder, itemSearchFunction) => {
    const newPurchaseOrder = {
        amount: purchaseOrder.PurchaseOrder.TotalAmt,
        externalId: purchaseOrder.PurchaseOrder.Id,
        externalJSON: JSON.stringify(purchaseOrder),
        referenceName: purchaseOrder.PurchaseOrder.DocNumber,
        items: [] 
    }
    newPurchaseOrder.amount = purchaseOrder.PurchaseOrder.TotalAmt;
    for (let n=0; n<purchaseOrder.PurchaseOrder.Line.length; ++n) {
        const line = purchaseOrder.PurchaseOrder.Line[n];
        const lineDetail = line[line.DetailType];
        const itemRef = lineDetail.ItemRef;
        
        logger.info(`Getting item details from reference value ${itemRef.value}`);
        const item = await itemSearchFunction(itemRef.value);
        logger.debug('Item retrieved from QS', item);

        newPurchaseOrder.items.push({
            sku: item.Item.Sku,
            qty: lineDetail.Qty,
            unitPrice: lineDetail.UnitPrice,
            amount: line.Amount
        })
    }
    return newPurchaseOrder;
}

/** Saves a Quickbooks integration PurchaseOrder locally */
const saveQuickbooksPurchaseOrder = async (purchaseOrder, itemSearchFunction) => {
    if (purchaseOrder && itemSearchFunction) {
        const localPurchaseOrder = await convertQuickbooksPurchaseOrder(purchaseOrder, itemSearchFunction);
        const saved = await createPurchaseOrder(localPurchaseOrder);
        return saved;
    } else {
        logger.error('Cannot save an integration Quickbooks PurchaseOrder if not given or the item search function is missing');
        return null;
    }
}

module.exports = {
    createPurchaseOrder,
    getPurchaseOrderByQuery,
    saveQuickbooksPurchaseOrder
}
