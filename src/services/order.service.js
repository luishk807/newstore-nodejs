const Order = require('../pg/models/Orders');
const OrderActivity = require('../pg/models/OrderActivities');
const OrderProduct = require('../pg/models/OrderProducts');
const User = require('../pg/models/Users');
const sendgrid = require('../controllers/sendgrid/orders');
const { calculateTotal } = require('../utils');
const config = require('../config');
const s3 = require('./storage.service');
const includes = ['orderCancelReasons', 'orderStatuses', 'orderUser', 'orderOrderProduct', 'deliveryOrder', 'orderOrderPayment'];
const orderBy = [['createdAt', 'DESC'], ['updatedAt', 'DESC']];
const { Op } = require('sequelize');
const sequelize = require('../pg/sequelize')
const { updateStock } = require('../services/product.stock.service');

const saveStatusOrder = async(id, userId, status) => {
    const orderInfo = await Order.findOne({where: {id: id}});
    if (orderInfo) {
        if (orderInfo.orderStatusId !== status) {
                const resp = await OrderActivity.create({
                orderStatusId: status,
                userId: userId ? userId : null,
                orderId: id
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
    if (user.type !== '1') {
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

    return await Order.destroy({
        where: {
            id: order.id
        }
    })
}

const updateOrder = async(req) => {
    const body = req.body;
    const id = req.params.id;
    const user = req.user;
    const order = await getOrder(id, req.user);
    if (order) {
      await saveStatusOrder(id, user.id, req.body.orderStatus);
      const result = await Order.update(body,
        {
          where: {
            id: id
          }
        }
      );
      if (result[0]) {
        return true;
      } else {
        return false;
      }
    } else {
        return { code: 401, status: false, message: 'not authorized'}
    }
}

const cancelOrder = async(req) => {
    const user = req.user;
    const id = req.params.id;
    const cancel = req.params.cancel;
    const orderInfo = await getOrder(id, user);
    const url = req.headers.referer;
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
        },{
            where: {
                id: id
            }
        });
        
        if (resp) {
            await sendgrid.sendOrderCancelRequest(orderInfo, req);
            return true;
        } else {
            return false
        }
    }

}

const getOrderByOrderNumberEmail = async(orderNumber, email) => {
    return await Order.findOne({ where: {order_number: orderNumber, shipping_email: email, userId: null}, include: includes, order: orderBy});
}

const getOrderByUser = async(loggedInUser, userId) => {
    if (loggedInUser.type == '1') {
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
    if (user.type == '1') {
        return await Order.findAll({include: includes, order: orderBy});
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
      'shipping_name': body.shipping_name,
      'shipping_address': body.shipping_address,
      'shipping_email': body.shipping_email,
      'shipping_city': body.shipping_city,
      'shipping_country': body.shipping_country,
      'shipping_phone': body.shipping_phone,
      'shipping_province': body.shipping_province,
      'shipping_township': body.shipping_township,
      'shipping_corregimiento': body.shipping_corregimiento,
      'shipping_zip': body.shipping_zip,
      'shipping_zone': body.shipping_zone,
      'shipping_district': body.shipping_district,
      'shipping_note': body.shipping_note,
    }
    
    if (!!!isNaN(body.deliveryOptionId)) {
      entry['deliveryOptionId'] = body.deliveryOptionId;
      entry['deliveryOption'] = body.deliveryOption;
    }
    if (!!!isNaN(body.deliveryServiceId)) {
      entry['deliveryServiceId'] = body.deliveryServiceId;
      entry['deliveryService'] = body.deliveryService;
    }
    if (!!!isNaN(body.paymentOptionId)) {
      entry['paymentOptionId'] = body.paymentOptionId;
      entry['paymentOption'] = body.paymentOption;
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
            await saveStatusOrder(orderCreated.id, userId, 1);
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
            if (Object.keys(carts).length) {
                for(const cart in carts) {
                    cartArry.push({
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
                        productDiscount: carts[cart].discount ? carts[cart].discount.name : null,
                        originalPrice: carts[cart].originalPrice,
                        savePercentageShow: carts[cart].save_percentag_show,
                        savePercentage: carts[cart].save_percentage,
                        savePrice: carts[cart].save_price,
                        category: carts[cart].productItemProduct.category,
                        quantity: carts[cart].quantity,
                        total: parseInt(carts[cart].quantity) * parseFloat(carts[cart].retailPrice),
                        brand: carts[cart].productItemProduct.brand,
                    });
                }
                orderObj.cart = cartArry;
                const orderProducts = await OrderProduct.bulkCreate(cartArry, { transaction: t, returning: true });
                // Update stocks on product items, and creates history of stock movement
                const updateResult = await updateStock(orderProducts, t);
                if (!updateResult) {
                    logger.error('Error updating stock');
                }
                // Commit the entire transaction
                await t.commit();
                await sendgrid.sendOrderEmail(orderObj, req);
                return orderObj;
            } else { // There will always be items in cart, will it ever reach this else?
                // Commit the entire transaction
                await t.commit();
                await sendgrid.sendOrderEmail(orderObj, req);
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
    getOrder,
    cancelOrder,
    createOrder,
    getOrderByOrderNumberEmail,
    getOrderByUser,
    getAllOrder,
    getOrderById,
    getMyOrders,
}
