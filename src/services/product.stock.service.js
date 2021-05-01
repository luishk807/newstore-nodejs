const ProductItem = require('../pg/models/ProductItems');
const ProductStockHistory = require('../pg/models/ProductStockHistory');
const { Op } = require('sequelize');
const logger = global.logger;

const STOCK_MODE = Object.freeze({ INCREASE: 1, REDUCE: 2 });

/** Updates the stock based on the given  */
const updateStock = async (orderProductsArray, transaction) => {
    const pids = orderProductsArray.map(op => +op.productItem);
    const productItemsToUpdate = await ProductItem.findAll({ where: { id: { [Op.in]: pids } } });

    const stocksToUpdate = [];
    // Go through each and do the deduction
    orderProductsArray.forEach(op => {
        const productItem = productItemsToUpdate.find(piu => +piu.id === +op.productItem);
        if (productItem) {
            const stockResult = productItem.stock - op.quantity;
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
    await addStockHistory(orderProductsArray, transaction);
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
const addStockHistory = (stockArray, { transaction, mode = STOCK_MODE.DECREASE }) => {
    const movements = [];
    stockArray.forEach(p => {
        movements.push(createStockHistoryObject(p, mode));
    });
    const fields = ['product_id', 'product_item_id', 'orders_id', 'order_products_id', 'createdAt', 'quantity'];
    return ProductStockHistory.bulkCreate(movements, { transaction, fields });
}

module.exports = {
    STOCK_MODE,
    updateStock
}
