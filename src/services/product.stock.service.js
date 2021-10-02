const ProductItem = require('../pg/models/ProductItems');
const ProductStockHistory = require('../pg/models/ProductStockHistory');
const { Op } = require('sequelize');
const sequelize = require('../pg/sequelize');
const logger = global.logger;

const STOCK_MODE = Object.freeze({ INCREASE: 1, DECREASE: 2 });

/** Returns the addition based on the STOCK_MODE given */
const getStockAmount = (stockQty, quantity, stockMode = STOCK_MODE.DECREASE) => {
    if (stockMode === STOCK_MODE.DECREASE) {
        return (+stockQty) - (+quantity);
    }
    if (stockMode === STOCK_MODE.INCREASE) {
        return (+stockQty) + (+quantity);
    }
}

/** Updates the stock based on the given products from order */
const updateStock = async (orderProductsArray, { transaction, stockMode = STOCK_MODE.DECREASE }) => {
    const pids = orderProductsArray.map(op => +op.productItem);
    const productItemsToUpdate = await ProductItem.findAll({ where: { id: { [Op.in]: pids } } });

    const stocksToUpdate = [];
    // Go through each and do the deduction
    orderProductsArray.forEach(op => {
        const productItem = productItemsToUpdate.find(piu => +piu.id === +op.productItem);
        if (productItem) {
            const stockResult = getStockAmount(productItem.stock, op.quantity, stockMode);
            if (stockResult < 0) {
                // SHOUT because it got over ordered
                logger.error(`Product item: ${op.productItem} is getting negative stock for order`, op);
            }
            stocksToUpdate.push({ id: +op.productItem, stock: stockResult });
        }
    });
    // Update stock
    await updateProductItemsStock(stocksToUpdate, transaction);
    // Add stock history registries
    await addStockHistory(orderProductsArray, { transaction, stockMode });
    return true;
}

/** Updates the given stocks from the product item given */
const updateProductItemsStock = async (productItemsStocks, transaction) => {
    for (let n = 0; n < productItemsStocks.length; ++n) {
        await ProductItem.update({ stock: productItemsStocks[n].stock }, { where: { id: productItemsStocks[n].id }, transaction });
    }
}

const createStockHistoryObject = (value, stockMode = STOCK_MODE.DECREASE) => {
    return {
        ...value.product && { product_id: +value.product },
        ...value.productItem && { product_item_id: +value.productItem },
        ...value.order && { orders_id: +value.order },
        ...value.id && { order_products_id: +value.id },
        createdAt: new Date(),
        quantity: (stockMode === STOCK_MODE.DECREASE) ? -value.quantity : value.quantity
    }
}

/** Add an entry of stock history tracking where stock moved */
const addStockHistory = (stockArray, { transaction, stockMode = STOCK_MODE.DECREASE }) => {
    const movements = [];
    stockArray.forEach(p => {
        movements.push(createStockHistoryObject(p, stockMode));
    });
    const fields = ['product_id', 'product_item_id', 'orders_id', 'order_products_id', 'createdAt', 'quantity'];
    return ProductStockHistory.bulkCreate(movements, { transaction, fields });
}

/** Increment stock on given product items array */
const incrementStocks = async (productItemArray, { transaction = null }) => {
    if (productItemArray.length && productItemArray.length > 0) {
        let t = transaction;
        if (!t) { // Create a transaction if not provided
            t = await sequelize.transaction();
        }
        try {
            const results = [];
            // Go through each of the items and increas the stock
            for (let n=0; n<productItemArray.length; ++n) {
                const pi = productItemArray[n];
                // id, stock, sku
                const result = await ProductItem.increment('stock', { by: pi.qty , where: { id: pi.id, sku: pi.sku }, transaction: t });
                results.push(result);
            }
            t.commit();
            return results;
        } catch (error) {
            logger.error('Error incrementing stock for the given product items');
            logger.error(error);
            t.rollback();
        }
    }
    return [];
}

module.exports = {
    STOCK_MODE,
    updateStock,
    incrementStocks
}
