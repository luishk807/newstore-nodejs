const Order = require('../pg/models/Orders');
const OrderActivity = require('../pg/models/OrderActivities');
const OrderProduct = require('../pg/models/OrderProducts');
const ProductBundle = require('../pg/models/ProductBundles');
const Category = require('../pg/models/Categories');
const Brand = require('../pg/models/Brands');
const ProductDiscount = require('../pg/models/ProductDiscounts');
const User = require('../pg/models/Users');
const sendgrid = require('../controllers/sendgrid/orders');
const { calculateTotal, checkIfEmpty, paginate } = require('../utils');
const config = require('../config');
const s3 = require('./storage.service');
const includes = ['orderCancelReasons', 'orderStatuses', 'orderUser', 'orderOrderProduct', 'deliveryOrder', 'orderOrderPayment', 'orderDeliveryServiceGroupCost', 'orderPromotion'];
const includes_non_user = ['orderCancelReasons', 'orderStatuses', 'orderOrderProduct', 'deliveryOrder', 'orderOrderPayment', 'orderDeliveryServiceGroupCost'];
const orderBy = [['createdAt', 'DESC'], ['updatedAt', 'DESC']];
const { Op } = require('sequelize');
const sequelize = require('../pg/sequelize')
const { updateStock, STOCK_MODE } = require('../services/product.stock.service');
const { callHook } = require('../utils/hooks');
const HOOKNAMES = require('../constants/hooknames');
const logger = global.logger;
const LIMIT = config.defaultLimit;

const sendToHook = async (eventName, params) => {
    try {
        logger.info(`Calling hooks for ${HOOKNAMES.ORDER}:${eventName}`);
        callHook(HOOKNAMES.ORDER, eventName, params);
    } catch (error) {
        logger.error(error);
    }
}

const saveStatusOrder = async(orId, userId, status) => {
    const orderInfo = await Order.findOne({where: {id: orId}});
    if (orderInfo) {
        if (orderInfo.orderStatusId !== status) {
                const resp = await OrderActivity.create({
                    orderStatusId: status,
                    userId: userId ? userId : null,
                    orderId: orId
                });
            return resp
        } else {
            return false;
        }
    } else {
        return false
    }
}

const getOrder = async(id, user) => {
    if (!id || !user) {
        return null;
    }

    let order = null;
    if (!config.adminRoles.includes(+user.type)) {
        order = await Order.findOne({ where: {id: id, userId: user.id }, include: includes});
    } else {
        order = await Order.findOne({ where: {id: id }, include: includes});
    }

    return order;
}

const deleteOrderById = async(id, user) => {
    const order = await getOrder(id, user);

    if (!order) {
        return { code: 500, status: false, message: "Order invalido" }
    }

    const t  = await sequelize.transaction();
    try {
        // STOCK_MODE.INCREASE, because we want to increase our product stock again
        await updateStock(order.orderOrderProduct, { transaction: t, stockMode: STOCK_MODE.INCREASE });
        const result = await Order.destroy({ where: { id: order.id } }, { transaction: t });
        t.commit();
        return result;
    } catch (error) {
        logger.error(`Error updating stock and delting the order: ${id}`, error);
        t.rollback();
    }
}

const updateOrder = async(req) => {
    const body = req.body;
    const id = req.params.id;
    const user = req.user;
    const order = await getOrder(id, req.user);

    if (Number(body.deliveryServiceFee) > 0) {
        body.deliveryServiceFee = Number(body.deliveryServiceFee);
    } else {
        body.deliveryServiceFee = null;
    }

    if (order) {
        if (req.body.orderStatus) {
            await saveStatusOrder(id, user.id, req.body.orderStatus);
        }
        if (order.deliveryServiceFee != req.body.deliveryServiceFee && req.body.deliveryServiceFee > 0) {
            await saveStatusOrder(id, user.id, 13);
        }

        const result = await Order.update(body,
        {
            where: {
            id: id
            }
        }
        );
        if (result[0]) {
            const updatedOrder = await getOrder(id, req.user);
            await sendgrid.sendOrderUpdate(updatedOrder, req);
            return true;
        } else {
            return false;
        }

    } else {
        return { code: 401, status: false, message: 'not authorized'}
    }
}

const updateAdminOrder = async(req) => {
    const body = req.body;
    body['cart'] = body.products;
    delete body.products;
    const id = req.params.id;
    const user = req.user;
    const order = await getOrder(id, req.user);

    const carts = JSON.parse(body.cart);
    let email =body.shipping_email;
    const getTotal = await calculateTotal(body);

    let entry = {
      'subtotal': getTotal.subtotal,
      'grandtotal': getTotal.grandTotal,
      'tax': getTotal.taxes,
      'totalSaved': getTotal.saved,
      'delivery': getTotal.delivery,
      'coupon': getTotal.coupon,
      'shipping_name': checkIfEmpty(body.shipping_name) ? null : body.shipping_name,
      'shipping_address': checkIfEmpty(body.shipping_address) ? null : body.shipping_address,
      'shipping_addressB': checkIfEmpty(body.shipping_addressB) ? null : body.shipping_addressB,
      'shipping_email': checkIfEmpty(body.shipping_email) ? null : body.shipping_email,
      'shipping_city': checkIfEmpty(body.shipping_city) ? null : body.shipping_city,
      'shipping_country': checkIfEmpty(body.shipping_country) ? null : body.shipping_country,
      'shipping_phone': checkIfEmpty(body.shipping_phone) ? null : body.shipping_phone,
      'shipping_province': checkIfEmpty(body.shipping_province) ? null : body.shipping_province,
      'shipping_township': checkIfEmpty(body.shipping_township) ? null : body.shipping_township,
      'shipping_corregimiento': checkIfEmpty(body.shipping_corregimiento) ? null : body.shipping_corregimiento,
      'shipping_zip': checkIfEmpty(body.shipping_zip) ? null : body.shipping_zip,
      'shipping_zone': checkIfEmpty(body.shipping_zone) ? null : body.shipping_zone,
      'shipping_district': checkIfEmpty(body.shipping_district) ? null : body.shipping_district,
      'shipping_note': checkIfEmpty(body.shipping_note) ? null : body.shipping_note,
    }
    
    if (!!!isNaN(body.deliveryOptionId)) {
      entry['deliveryOptionId'] = body.deliveryOptionId;
      entry['deliveryOption'] = body.deliveryOption;
    } else {
      entry['deliveryOptionId'] = null;
      entry['deliveryOption'] = null;     
    }

    if (!!!isNaN(body.deliveryServiceId)) {
      entry['deliveryServiceGroupCostId'] = body.deliveryServiceId;
      entry['deliveryService'] = body.deliveryService;
    } else {
      entry['deliveryServiceGroupCostId'] = null;
      entry['deliveryService'] = null;
    }

    if (!!!isNaN(body.promotionCodeId) && getTotal.coupon) {
      entry['promotionCodeId'] = body.promotionCodeId;
      entry['promotionCode'] = body.promotionCode;
    } else {
      entry['promotionCodeId'] = null;
      entry['promotionCode'] = null;
    }
    
    if (!!!isNaN(body.paymentOptionId)) {
      entry['paymentOptionId'] = body.paymentOptionId;
      entry['paymentOption'] = body.paymentOption;
    }
  
    let originalOrderProducts = [];
    const t  = await sequelize.transaction();

    try {
        const orderUpdate = await Order.update(
            entry, 
            { where: { id: id }, transaction: t }
        );

        if (orderUpdate) {
            let cartArry = [];
            
            let orderObj = {
                entry: entry,
                orderId: id,
                order_num: order.order_num,
                cart: [],
                clientEmail: email
            }

            // Get original order products (items in order)
            originalOrderProducts = await OrderProduct.findAll({ where: { orderId: id }});
            // Revert the stock by setting mode to increase, this has to be done before updating the stock at the end, because new entries
            // for OrderProduct are created
            const isolatedTransaction  = await sequelize.transaction(); // Use another transaction
            const revertStockResult = await updateStock(originalOrderProducts, { transaction: isolatedTransaction, stockMode: STOCK_MODE.INCREASE });
            if (!revertStockResult) {
                const message = 'Error reverting stock before updating stock during order edit';
                logger.error(message);
                await isolatedTransaction.rollback();
                throw new Error(message);
            } else {
                await isolatedTransaction.commit();
            }

            await OrderProduct.destroy({
                where: {
                    orderId: id
                }
            }, { transaction: t });

            await OrderActivity.create({
                orderStatusId: 15,
                orderId: id
            }, { transaction: t });
            
            if (Object.keys(carts).length) {
                for(const cart in carts) {
                    let item = {
                        orderId: id,
                        productItemId: carts[cart].id,
                        unit_total: carts[cart].retailPrice,
                        name: carts[cart].productItemProduct.name,
                        description: carts[cart].productItemProduct.description,
                        model: carts[cart].model,
                        color: carts[cart].productItemColor.name,
                        sku: carts[cart].sku,
                        product: carts[cart].product,
                        size: carts[cart].productItemSize.name,
                        code: carts[cart].sku,
                        productDiscount: null,
                        originalPrice: carts[cart].originalPrice,
                        savePercentageShow: carts[cart].save_percentag_show,
                        savePercentage: carts[cart].save_percentage,
                        savePrice: carts[cart].save_price,
                        category: carts[cart].productItemProduct.category,
                        productBundleId: carts[cart].bundle ? carts[cart].bundle.id : null,
                        quantity: null,
                        total: parseInt(carts[cart].quantity) * parseFloat(carts[cart].retailPrice),
                        brand: carts[cart].productItemProduct.brand,
                    }
                    if (carts[cart].discount) {
                        const getDiscount = await ProductDiscount.findOne({where: { id: carts[cart].discount.id }});
                        if (getDiscount && carts[cart].quantity >= getDiscount.minQuantity) {
                            item.productDiscount = carts[cart].discount.name;
                            item.quantity = carts[cart].quantity;
                        } else {
                            logger.error('Error saving order, will rollback order', error);
                            await t.rollback();
                            return {status: false, code: 500, message: 'error with discount'}
                        }
                    }
                    else if (carts[cart].bundle) {
                        const getBundle = await ProductBundle.findOne({where: { id: carts[cart].bundle.id, productItemId: carts[cart].id}});
                        if (getBundle) {
                            item.productDiscount = carts[cart].bundle.name;
                            item.quantity = carts[cart].quantity * carts[cart].bundle.quantity;
                        } else {
                            logger.error('Error saving order, will rollback order', error);
                            await t.rollback();
                            return {status: false, code: 500, message: 'error with bundle'}
                        }
                    } else {
                        item.quantity = carts[cart].quantity;
                    }
                    cartArry.push(item);
                }
                orderObj.cart = cartArry;
                const orderProducts = await OrderProduct.bulkCreate(cartArry, { transaction: t, returning: true });
                // Update stocks on product items, and creates history of stock movement
                const updateResult = await updateStock(orderProducts, { transaction: t });
                if (!updateResult) {
                    logger.error('Error updating stock');
                    throw new Error('Error updating stocks')
                }
                // Commit the entire transaction
                await t.commit();
                sendToHook('save', orderObj);
              //  await sendgrid.sendOrderConfirmationEmail(orderObj, { referer: req.headers.referer });
                return orderObj;
            } else { // There will always be items in cart, will it ever reach this else?
                //Commit the entire transaction
                await t.commit();
                sendToHook('save', orderObj);
                //await sendgrid.sendOrderConfirmationEmail(orderObj, { referer: req.headers.referer });
                return orderObj;
            }
        } else {
            return false;
        }
    } catch (error) {
        logger.error('Error saving order, will rollback order', error);
        await t.rollback();
        // Have to rollback from original revert of stock which was from a different transaction, manually
        const isolatedTransaction  = await sequelize.transaction();
        // Decrease back the stock from the original order products
        const revertStockResult = await updateStock(originalOrderProducts, { transaction: isolatedTransaction });
        if (!revertStockResult) {
            const message = 'Error reverting stock to its original state after trying updating stock during order edit';
            logger.error(message, originalOrderProducts);
            await isolatedTransaction.rollback();
            throw new Error(message);
        } else {
            await isolatedTransaction.commit();
        }
    }
    return false;
}


const cancelOrder = async(req) => {
    const user = req.user;
    const id = req.params.id;
    const cancel = req.params.cancel;
    const orderInfo = await getOrder(id, user);
    const allowedCancelStatus = [1,2];

    if (!orderInfo) {
        return { code: 500, status: false, message: "Order invalido" }
    }
    // save status
    if (!allowedCancelStatus.includes(Number(orderInfo.orderStatus))) {
        return {status: false, code: 500, message: "invalid cancel status"};
    } else {
        await saveStatusOrder(id, user.id, 7);
        const resp = await Order.update({
            orderCancelReasonId: cancel,
            orderStatusId: 7
        }, { where: { id: id } });
        
        if (resp) {
            try {
                await Promise.all([
                    updateStock(orderInfo.orderOrderProduct, { stockMode: STOCK_MODE.INCREASE })
                ]);
                sendToHook('delete', { id });
                return true;
            } catch (error) {
                logger.error(`Error on canceling order: ${id}`, error)
            }
        } else {
            return false
        }
    }

}

const getOrderByOrderNumberEmail = async(orderNumber, email) => {
    return await Order.findOne({ where: {order_number: orderNumber, shipping_email: email}, include: includes_non_user, order: orderBy});
}

const getOrderByOrderNumber = async(orderNumber) => {
    return await Order.findOne({ where: {order_number: orderNumber}, include: includes, order: orderBy});
}

const getOrderByUser = async(loggedInUser, userId) => {
    if (config.adminRoles.includes(+loggedInUser.type)) {
        return await Order.findAll({ where: {userId: userId}, include: includes, order: orderBy });
    } else {
        return await Order.findAll({ where: {userId: userId, userId: loggedInUser.id}, include: includes, order: orderBy });
    }
}

const getMyOrders = async(user) => {
    return await Order.findAll({ where: {userId: user.id}, include: includes, order: orderBy });
}

const getOrderById = async(id, user) => {
    return await getOrder(id, user);
}

const getAllOrder = async(user) => {
    if (config.adminRoles.includes(+user.type)) {
        return await Order.findAll({include: includes, order: orderBy});
    } else {
        return {status: false, code: 401, message: 'not authorized'}
    }
}

const getAllOrderWithFilter = async(user, filter) => {
    let query = {
        include: includes
    }

    const page = filter.page;

    const sortBy = filter.sortBy ? filter.sortBy : null;

    const searchValue = filter.searchValue ? filter.searchValue : null;

    const searchBy = filter.searchBy ? filter.searchBy : null;

    let orderBy = null;

    // check if column exists
    if (searchBy && searchValue) {
        const check  = await sequelize.query(`SELECT column_name FROM information_schema.columns WHERE table_name='orders' and column_name='${searchBy}'`, { raw: true});
        if (check && check[0].length) {
            switch(searchBy) {
                case 'shipping_name':
                case 'shipping_phone': {
                    query = {
                        ...query,
                        where: {
                           [`${searchBy}`]: {
                                [Op.iLike]: `%${searchValue}%`
                            }
                        }
                    }
                    break;
                }
                default: {
                    query = {
                        ...query,
                        where: {
                           [`${searchBy}`]: `${searchValue}`
                        }
                    }
                }
            }
        }
    }
    if (sortBy) {
        switch(sortBy) {
            case 'date_new': {
                orderBy = [
                    ['createdAt', 'DESC'],
                ]
                break;
            }
            case 'date_old': {
                orderBy = [
                    ['createdAt', 'ASC'],
                ]
                break;
            }
            case 'status_high': {
                orderBy = [
                    [sequelize.literal(`"orders"."orderStatusId" DESC`)],
                    ['createdAt', 'DESC'],
                ]
                break;
            }
            case 'status_low': {
                orderBy = [
                    [sequelize.literal(`"orders"."orderStatusId" ASC`)],
                    ['createdAt', 'DESC'],
                ]
                break;
            }
            default: {
                orderBy = [
                    [sequelize.literal(`case when "orders"."orderStatusId" = ${Number(sortBy)} then 1 end`)],
                    ['createdAt', 'DESC'],
                ]
            }
        }
    } else {
        orderBy = [
            ['updatedAt', 'DESC'],
            ['createdAt', 'DESC'],
        ]
    }

    if (page) {
        query = {
            ...query,
            limit: LIMIT,
            distinct: true,
            order: orderBy,
            offset: paginate(page),
        }
    } else {
        query = {
            ...query,
            order: orderBy,
        }
    }


    if (config.adminRoles.includes(+user.type)) {
        if (page) {
            return await Order.findAndCountAll(query);
        } else {
            return await Order.findAll(query);
        }
    } else {
        return {status: false, code: 401, message: 'not authorized'}
    }
}

const createOrder = async(req) => {
    const body = req.body;
    const userId = req.user ? req.user.id : null;
    const carts = JSON.parse(body.cart);
    const entryUser = parseInt(body.userid);
    let email =body.shipping_email;;
    const getTotal = await calculateTotal(body);

    let entry = {
      'subtotal': getTotal.subtotal,
      'grandtotal': getTotal.grandTotal,
      'tax': getTotal.taxes,
      'totalSaved': getTotal.saved,
      'delivery': getTotal.delivery,
      'coupon': getTotal.coupon,
      'shipping_name': checkIfEmpty(body.shipping_name) ? null : body.shipping_name,
      'shipping_address': checkIfEmpty(body.shipping_address) ? null : body.shipping_address,
      'shipping_email': checkIfEmpty(body.shipping_email) ? null : body.shipping_email,
      'shipping_city': checkIfEmpty(body.shipping_city) ? null : body.shipping_city,
      'shipping_country': checkIfEmpty(body.shipping_country) ? null : body.shipping_country,
      'shipping_phone': checkIfEmpty(body.shipping_phone) ? null : body.shipping_phone,
      'shipping_province': checkIfEmpty(body.shipping_province) ? null : body.shipping_province,
      'shipping_township': checkIfEmpty(body.shipping_township) ? null : body.shipping_township,
      'shipping_corregimiento': checkIfEmpty(body.shipping_corregimiento) ? null : body.shipping_corregimiento,
      'shipping_zip': checkIfEmpty(body.shipping_zip) ? null : body.shipping_zip,
      'shipping_zone': checkIfEmpty(body.shipping_zone) ? null : body.shipping_zone,
      'shipping_district': checkIfEmpty(body.shipping_district) ? null : body.shipping_district,
      'shipping_note': checkIfEmpty(body.shipping_note) ? null : body.shipping_note,
    }
    
    if (!!!isNaN(body.deliveryOptionId)) {
      entry['deliveryOptionId'] = body.deliveryOptionId;
      entry['deliveryOption'] = body.deliveryOption;
    }
    if (!!!isNaN(body.deliveryServiceId)) {
      entry['deliveryServiceGroupCostId'] = body.deliveryServiceId;
      entry['deliveryService'] = body.deliveryService;
    }
    if (!!!isNaN(body.paymentOptionId)) {
      entry['paymentOptionId'] = body.paymentOptionId;
      entry['paymentOption'] = body.paymentOption;
    }
    if (!!!isNaN(body.promotionCodeId) && getTotal.coupon) {
        entry['promotionCodeId'] = body.promotionCodeId;
        entry['promotionCode'] = body.promotionCode;
      }
    if (!!!isNaN(entryUser)) {
      entry['userId'] = body.userid;
      const findUser = await User.findOne({where: { id: body.userid}});
      if (findUser) {
          email = findUser.email;
      }
    }

    const t  = await sequelize.transaction();

    try {
        const orderCreated = await Order.create(entry, { transaction: t });

        if (orderCreated) {
            let cartArry = [];

            const time = Date.now().toString() // '1492341545873'
            const order_num = `${time}${orderCreated.id}`;
            await Order.update(
                { 'order_number': order_num },
                { where: { id: orderCreated.id }, transaction: t }
            );
            
            let orderObj = {
                entry: entry,
                orderId: orderCreated.id,
                order_num: order_num,
                cart: [],
                clientEmail: email
            }

            await OrderActivity.create({
                orderStatusId: 1,
                orderId: orderCreated.id
            }, { transaction: t });
            
            if (Object.keys(carts).length) {
                for(const cart in carts) {
                    let item = {
                        orderId: orderCreated.id,
                        productItemId: carts[cart].id,
                        unit_total: carts[cart].retailPrice,
                        name: carts[cart].productItemProduct.name,
                        description: carts[cart].productItemProduct.description,
                        model: carts[cart].model,
                        color: carts[cart].productItemColor.name,
                        sku: carts[cart].sku,
                        product: carts[cart].product,
                        size: carts[cart].productItemSize.name,
                        code: carts[cart].sku,
                        productDiscount: null,
                        originalPrice: carts[cart].originalPrice,
                        savePercentageShow: carts[cart].save_percentag_show,
                        savePercentage: carts[cart].save_percentage,
                        savePrice: carts[cart].save_price,
                        category: carts[cart].productItemProduct.category,
                        productBundleId: carts[cart].bundle ? carts[cart].bundle.id : null,
                        quantity: null,
                        total: parseInt(carts[cart].quantity) * parseFloat(carts[cart].retailPrice),
                        brand: carts[cart].productItemProduct.brand,
                    }
                    if (carts[cart].discount) {
                        const getDiscount = await ProductDiscount.findOne({where: { id: carts[cart].discount.id }});
                        if (getDiscount && carts[cart].quantity >= getDiscount.minQuantity) {
                            item.productDiscount = carts[cart].discount.name;
                            item.quantity = carts[cart].quantity;
                        } else {
                            await deleteOrderById(orderCreated.id);
                            return {status: false, code: 500, message: 'error with discount'}
                        }
                    }
                    else if (carts[cart].bundle) {
                        const getBundle = await ProductBundle.findOne({where: { id: carts[cart].bundle.id, productItemId: carts[cart].id}});
                        if (getBundle) {
                            item.productDiscount = carts[cart].bundle.name;
                            item.quantity = carts[cart].quantity * carts[cart].bundle.quantity;
                        } else {
                            await deleteOrderById(orderCreated.id);
                            return {status: false, code: 500, message: 'error with bundle'}
                        }
                    } else {
                        item.quantity = carts[cart].quantity;
                    }
                    cartArry.push(item);
                }
                orderObj.cart = cartArry;
                const orderProducts = await OrderProduct.bulkCreate(cartArry, { transaction: t, returning: true });
                // Update stocks on product items, and creates history of stock movement
                const updateResult = await updateStock(orderProducts, { transaction: t });
                if (!updateResult) {
                    logger.error('Error updating stock');
                    throw new Error('Error updating stocks')
                }
                // Commit the entire transaction
                await t.commit();
                sendToHook('create', orderObj);
                await sendgrid.sendOrderConfirmationEmail(orderObj, { referer: req.headers.referer });
                return orderObj;
            } else { // There will always be items in cart, will it ever reach this else?
                // Commit the entire transaction
                await t.commit();
                sendToHook('create', orderObj);
                await sendgrid.sendOrderConfirmationEmail(orderObj, { referer: req.headers.referer });
                return orderObj;
            }
        } else {
            return false;
        }
    } catch (error) {
        logger.error('Error creating order, will rollback order', error);
        await t.rollback();
    }
    return false;
}


module.exports = {
    deleteOrderById,
    saveStatusOrder,
    updateOrder,
    updateAdminOrder,
    getOrder,
    cancelOrder,
    createOrder,
    getOrderByOrderNumberEmail,
    getOrderByOrderNumber,
    getOrderByUser,
    getAllOrder,
    getOrderById,
    getMyOrders,
    getAllOrderWithFilter
}
