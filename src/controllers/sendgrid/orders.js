const config = require('../../config');
const ProductItem = require('../../pg/models/ProductItems');
const Delivery = require('../../pg/models/DeliveryOptions');
const ProductDiscount = require('../../pg/models/ProductDiscounts');
const sendGrid = require('@sendgrid/mail');
const aws_url = process.env.IMAGE_URL;
const logo = `${aws_url}/avenidaz.png`;
sendGrid.setApiKey(config.sendGrid.key);

const productIncludes = ['productItemsStatus','productItemProduct', 'productImages', 'productItemColor', 'productItemSize'];

const sendOrderUpdate = async(obj, req) => {
  const message = `Your order has been updated.`;
  const subject = `ORDER #${obj.order_num}: order updated`;
  const client_email = obj.shipping_email;
  const mainUrl = `${req.headers.referer}orders/account/${obj.id}`;
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
      <p>Name: ${client_email}</p><p>Message: Your order has been recently updated.</p>
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

  // send admin
  sendGrid.send({
    to: config.email.contact, // Change to your recipient
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

const sendOrderEmail = async(obj, req) => {
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
    if (item.productDiscountId) {
      const getProductDisc = await ProductItem.findOne({
        where: {
          id: item.productDiscountId
        }
      })
      if (getProductDisc) {
        ProductDiscount = `Discount: ${ProductDiscount.name}`;
      }
    }

    const imgUrl = product.productImages && product.productImages.length ? `${aws_url}/${product.productImages[0].img_url}` : `${req.headers.referer}images/no-image.jpg`;

    temp['imgUrl'] = imgUrl;
    
    cartHtml += `
    <table>
      <tr>
        <td style='width: 20%'>
          <img style='width: 100px;' src='${imgUrl}' />
        </td>
        <td style='width: 50%'>
          <p><strong>${item.name}</strong></p>
          <p>Model: ${item.model}</p>
          <p>Color: ${item.color}</p>
          <p>Size: ${item.size}</p>
          <p>Qt: ${item.quantity}</p>
          <p>Unit: $${item.unit_total}</p>
          <p>${ProductDiscount}</p>
        </td>
        <td style='width: 30%'>
          $${item.total}
        </td>
      </tr>
    </table>`

  }

  const totalHtml = `
    <hr/>
    <table>
    <tr>
      <td style='width: 50%'>
        Subtotal
      </td>
      <td style='width: 50%'>
        $${obj.entry.subtotal}
      </td>
    </tr>
    <tr>
      <td style='width: 50%'>
        Shipping
      </td>
      <td style='width: 50%'>
        $${obj.entry.delivery}
      </td>
    </tr>
    <tr>
      <td style='width: 50%'>
        Tax
      </td>
      <td style='width: 50%'>
        $${obj.entry.tax}
      </td>
    </tr>
  </table>
  <hr/>
  <table>
    <tr>
      <td style='width: 50%'>
        Total
      </td>
      <td style='width: 50%'>
        <strong>$${obj.entry.grandtotal}</strong>
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

  const message = `
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
    </p>
    <p>
      <strong>Shipping address</strong><br/>
      ${obj.entry.shipping_name}<br/>
      ${obj.entry.shipping_address}<br/>
      ${obj.entry.shipping_district}<br/>
      ${obj.entry.shipping_corregimiento}<br/>
      ${obj.entry.shipping_province}<br/>
      ${obj.entry.shipping_country}<br/><br/>
      Phone: ${obj.entry.shipping_phone}<br/>
    </p>
    ${deliveryHtml}`;



  const msg = {
    to: 'luishk807@gmail.com', // Change to your recipient
    from: config.email.contact, // Change to your verified sender
    subject: `${subject}`,
    html: message,
  }
  
  let result = null;
  return sendGrid.send(msg).then(() => {
    return true;
  })
  .catch((error) => {
    return false;
  })
}

module.exports = {
  sendOrderEmail,
  sendOrderCancelRequest
}