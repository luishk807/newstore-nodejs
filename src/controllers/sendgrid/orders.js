const config = require('../../config');
const ProductItem = require('../../pg/models/ProductItems');
const Product = require('../../pg/models/Products');
const Delivery = require('../../pg/models/DeliveryOptions');
const { getAdminEmail } = require('../../utils');
const sendGrid = require('@sendgrid/mail');
const { Op } = require('sequelize');
const { getTemplateText } = require('../../templates/es/order.confirmation');
const aws_url = process.env.IMAGE_URL;
const logo = `${aws_url}/avenidaz.png`;
sendGrid.setApiKey(config.sendGrid.key);

const productIncludes = ['productItemsStatus','productItemProduct', 'productImages', 'productItemColor', 'productItemSize'];

const sendOrderUpdate = async(obj, req) => {
  const mainUrl = `${req.headers.referer}account/orders/${obj.id}`;
  let status = obj.orderStatuses.name;
  if (!status) {
    status = `orden se ha actualizado`;
  }
  const subject = `ORDEN #${obj.order_number}: ${status}`;
  const client_email = obj.shipping_email;
  const client_name = obj.shipping_name;
  let result = false;

  // send user
  sendGrid.send({
    to: client_email, // Change to your recipient
    from: config.email.noReply, // Change to your verified sender
    subject: `${subject}`,
    html: `
      <p>
        <img src="${logo}" width="300" />
      </p>
      <p>${client_name},</p>
      <p>Estado de orden: ${status}</p>
      <p>Tu orden se ha actualizado recientemente.</p>
      <p>Puede verificar el estado de su pedido en cualquier momento, yendo a <a target="_blank" href='${mainUrl}'>Tus Ordenes</a> en su cuenta</p>
      <p>Si tiene alguna pregunta en relación a su pedido, comuníquese con nosotros a <a href='mailto:${config.email.sales}' target="_blank">ventas@avenidaz.com</a>.</p><br/>
      <p>Gracias,<br/>AvenidaZ.com</p>
    `,
  }).then(() => {
    result = true;
  });

  return result;
}

const sendOrderCancelRequest = async(obj, req) => {
  const message = `Your request for order cancellation has been sent.`;
  const subject = `ORDER #${obj.order_number}: order cancellation request`;
  const client_email = obj.shipping_email;
  const mainUrl = `${req.headers.referer}account/orders/${obj.id}`;
  const mainUrlAdmin = `${req.headers.referer}admin/orders/${obj.id}`;
  let result = false;

  const toEmail = getAdminEmail('contact');

  // send admin
  sendGrid.send({
    to: toEmail, // Change to your recipient
    from: config.email.noReply, // Change to your verified sender
    subject: `${obj.order_number}: ${subject}`,
    html: `
      <p>
        <img src="${logo}" width="300" />
      </p>
      <p>Name: ${client_email}</p><p>Message: order cancellation requestions for this order.</p><p>${mainUrlAdmin}</p>
    `,
  }).then(() => {
    result = true;
  });

  // send user
  sendGrid.send({
    to: client_email, // Change to your recipient
    from: config.email.noReply, // Change to your verified sender
    subject: `${obj.order_number}: ${subject} received`,
    html: `
      <p>
        <img src="${logo}" width="200" />
      </p>
      <p>Name: ${client_email}</p><p>Message: Your request for order cancellation has been sent.</p>
    `,
  }).then(() => {
    result = true;
  });

  return result;
}

/** @deprecated Replaced by sendOrderConfirmationEmail */
const sendOrderEmail = async(obj, req) => {
  let toEmail = [];
  toEmail.push(getAdminEmail('sales'));
  const mainUrl = `${req.headers.referer}account/orders/${obj.orderId}`;
  const newCart = [];
  const subject = `ORDER #${obj.order_num}: Order Received`;
  let cartHtml = '';

  for(const item of obj.cart) {
    const temp = Object.assign({}, item);

    const product = await ProductItem.findOne({
      where: {
        id: item.productItemId
      },
      include: productIncludes
    })

    let ProductDiscount = '';
    if (item.productDiscount) {
        ProductDiscount = `Discount: ${item.productDiscount}`;
  
    }

    // const imgUrl = product.productImages && product.productImages.length ? `${aws_url}/${product.productImages[0].img_url}` : `${req.headers.referer}images/no-image.jpg`;
    let imgUrl = product.productImages && product.productImages.length ? `${aws_url}/${product.productImages[0].img_url}` : null;

    if (!imgUrl) {
      const getBaseProduct = await Product.findOne({where: {id: product.productId}, include: ['productImages']});
      
      if (getBaseProduct) {
        imgUrl = getBaseProduct.productImages && product.productImages.length ? `${aws_url}/${getBaseProduct.productImages[0].img_url}` : null;
      }
    }

    if (!imgUrl) {
      imgUrl = `${req.headers.referer}images/no-image.jpg`;
    }

    temp['imgUrl'] = imgUrl;
    
    cartHtml += `
    <table style='width: 100%'>
      <tr>
        <td style='width: 20%; vertical-align: top; text-align: left'>
          <img style='width: 100px;' src='${imgUrl}' />
        </td>
        <td style='width: 50%; vertical-align: top; text-align: center'>
          <p><strong>${item.name}</strong></p>
          <p>Sku: ${item.sku}</p>
          <p>Color: ${item.color}</p>
          <p>Size: ${item.size}</p>
          <p>Qt: ${item.quantity}</p>
          <p>Unit: $${item.unit_total}</p>
          <p>${ProductDiscount}</p>
        </td>
        <td style='width: 30%; vertical-align: top; text-align: right'>
          $${item.total}
        </td>
      </tr>
    </table>`

  }

  let totalHtml = `
    <hr/>
    <table style='width: 100%'>
    <tr>
      <td style='width: 50%'></td>
      <td style='width: 50%'>
        <table style='width: 100%'>
          <tr>
            <td style='width: 50%; text-align: left'>
              Subtotal
            </td>
            <td style='width: 50%; text-align: right'>
              $${obj.entry.subtotal}
            </td>
          </tr>
          <tr>
            <td style='width: 50%; text-align: left'>
              ITBMS 7%
            </td>
            <td style='width: 50%; text-align: right'>
              $${obj.entry.tax}
            </td>
          </tr>
          <tr>
            <td style='width: 50%; text-align: left'>
              Shipping
            </td>
            <td style='width: 50%; text-align: right'>
              $${obj.entry.delivery}
            </td>
          </tr> `;
  
          if (obj.entry.coupon > 0) {
            totalHtml += `
            <tr>
              <td style='width: 50%; text-align: left'>
                Discount with coupon
              </td>
              <td style='width: 50%; text-align: right'>
                - $${obj.entry.coupon}
              </td>
            </tr>
            `;
          }

          if (obj.entry.totalSaved > 0) {
            totalHtml += `
            <tr>
              <td style='width: 50%; text-align: left'>
                You Saved
              </td>
              <td style='width: 50%; text-align: right'>
                - $${obj.entry.totalSaved}
              </td>
            </tr>
            `;
          }
  totalHtml += `  
        </table>
      </td>
  </table>`;
  totalHtml += `
  <hr/>
  <table style='width: 100%'>
    <tr>
       <td style='width:50%'></td>
       <td style='width:50%'>
          <table style='width:100%'>
            <tr>
              <td style='width: 50%; text-align: left'>
                Total
              </td>
              <td style='width: 50%; text-align: right'>
                <strong>$${obj.entry.grandtotal}</strong>
              </td>
            </tr>
          </table>
       </td>
    </tr>
  </table>
  `;

  let deliveryHtml = '';

  if (obj.entry.deliveryId) {
    const delivery = await Delivery.findOne({
      where: {
        id: obj.entry.deliveryId
      }
    });
    if (delivery) {
      deliveryHtml = `
      <p>
        <strong>Shipping Method</strong><br/>
        ${delivery.name}<br/>
      </p>
      `
    }
  }

  let message = `
    <p>
      <img src="${logo}" width="300" />
    </p>
    <p>ORDER #${obj.order_num}</p>
    <p><strong>Order Confirmation</strong></p>
    <p>
      We received your order and are getting started on it right away. We will send you an email with update approximately 1-3 business days.
    </p>
    <p>
      Thanks for shopping with us!
    </p>
    <p>
      <a target="_blank" href='${mainUrl}'>View your order</a>
    </p>
    <hr/>
    <p>
      <strong>Order Summary</strong>
    </p>
    ${cartHtml}
    ${totalHtml}
    <p>
      <strong>Customer Information</strong>
    </p>`;
    if (obj.entry.deliveryOptionId == 1) {
      message = `
      <p>
        <strong>Shipping address</strong><br/>
        ${obj.entry.shipping_name}<br/>
        Email: ${obj.entry.shipping_email}<br/>
        Phone: ${obj.entry.shipping_phone}<br/>
      </p>`;
    } else {
      message = `
      <p>
        <strong>Shipping address</strong><br/>
        ${obj.entry.shipping_name}<br/>
        ${obj.entry.shipping_address}<br/>
        ${obj.entry.shipping_district}<br/>
        ${obj.entry.shipping_corregimiento}<br/>
        ${obj.entry.shipping_province}<br/>
        ${obj.entry.shipping_country}<br/><br/>
        Phone: ${obj.entry.shipping_phone}<br/>
      </p>`;
    }

    message = `${deliveryHtml}`;

  if (process.env.NODE_ENV === "production") {
    toEmail.push(obj.clientEmail);
  }

  const msg = {
    to: toEmail, // Change to your recipient
    from: config.email.contact, // Change to your verified sender
    subject: `${subject}`,
    html: message,
  }

  
  return sendGrid.send(msg).then(() => {
    return true;
  })
  .catch((error) => {
    return false;
  })
}

const baseProductSearchFunc = async (id) => {
  return Product.findOne({ where: { id: id }, include: ['productImages'] });
}

const sendOrderConfirmationEmail = async(obj, { referer }) => {
  const toEmail = [];
  toEmail.push(getAdminEmail('sales'));
  const mainUrl = `${referer}account/orders/${obj.orderId}`;
  const subject = `ÓRDEN #${obj.order_num} RECIBIDA`;
  const piIds = obj.cart.map(pi => pi.productItemId);
  const promises = [];
  promises.push(ProductItem.findAll({ where: { id: { [Op.in]: piIds } }, includes: productIncludes }));
  // If there is an delivery id
  if (obj.entry.deliveryId) {
    promises.push(Delivery.findOne({ where: { id: obj.entry.deliveryId }, attributes: ['name'] }));
  }
  const [productItems, delivery] = await Promise.all(promises);

  const message = await getTemplateText(obj, { logo: logo, mainUrl, productItems, referer, awsImageUrl: aws_url, delivery, productSearchFunc: baseProductSearchFunc });

  if (process.env.NODE_ENV === "production") {
    toEmail.push(obj.clientEmail);
  }

  const msg = {
    to: toEmail, // Change to your recipient
    from: config.email.contact, // Change to your verified sender
    subject: `${subject}`,
    html: message,
  }

  return sendGrid.send(msg).then(() => {
    return true;
  })
  .catch(() => {
    return false;
  })
}

module.exports = {
  sendOrderEmail,
  sendOrderConfirmationEmail,
  sendOrderUpdate,
  sendOrderCancelRequest
}
