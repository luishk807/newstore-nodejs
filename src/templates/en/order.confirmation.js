const { formatNumber } = require('../../utils');

const getSingleImageUrl = async (product, { referer, awsUrl, productSearchFunc }) => {
    let imgUrl = product && product.productImages && product.productImages.length ? `${aws_url}/${product.productImages[0].img_url}` : null;
  
    if (!imgUrl && productSearchFunc) {
        const baseProduct = await productSearchFunc(product.productId);
        
        if (baseProduct) {
            imgUrl = baseProduct.productImages && baseProduct.productImages.length ? `${awsUrl}/${baseProduct.productImages[0].img_url}` : null;
        }
    }
  
    if (!imgUrl) {
        imgUrl = `${referer}images/no-image.jpg`;
    }
  
    return imgUrl;
}
  
const getSingleItemHtml = (item, { imgUrl, productDiscount }) => {
    return `<table>
        <tr>
        <td style="width: 20%; vertical-align: top;"><img style="width: 100px;" src="${imgUrl}" /></td>
        <td style="width: 50%">
            <p><strong>${item.name}</strong></p>
            <p>SKU: ${item.sku}</p>
            <p>Color: ${item.color}</p>
            <p>Size: ${item.size}</p>
            <p>Quantity: ${item.quantity}</p>
            <p>Unit: $${item.unit_total}</p>
            <p>${productDiscount}</p>
          </td>
          <td style="width: 30%">$${item.total}</td>
        </tr>
      </table>`;
}
  
const getTableRowFieldValue = (label, value, blankIfNoValue, boldValue) => {
    if (blankIfNoValue && !value) {
        return '';
    }
    let htmlValue = value;
    if (boldValue) {
        htmlValue = `<strong>${value}</strong>`;
    }
    return `<tr><td style="width: 50%">${label}</td><td style="width: 50%">${htmlValue}</td></tr>`;
}

const getTemplateText = async (obj, { mainUrl, productItems, referer, awsImageUrl, delivery, productSearchFunc, logo }) => {
    let cartHtml = '';
    for (const item of obj.cart) {
        const product = productItems.find(pi => +pi.id === +item.productItemId)
        let productDiscount = '';
        if (item.productDiscount) {
          productDiscount = `Discount: ${item.productDiscount}`;
        }

        const imgUrl = await getSingleImageUrl(product, { referer, awsUrl: awsImageUrl, productSearchFunc });
        item['imgUrl'] = imgUrl;
    
        // If item is coming from the frontend, it wouldn't be good to use this for showing the information
        // It would be more safe and secure to load that data from the database instead
        cartHtml += getSingleItemHtml(item, { imgUrl, productDiscount });
    }
    
    let totalHtml = `<hr/><table style="width: 99%; text-align: right;">
        ${getTableRowFieldValue('Subtotal', `$${formatNumber(obj.entry.subtotal)}`)}
        ${getTableRowFieldValue('Tax 7%', `$${formatNumber(obj.entry.tax)}`)}
        ${getTableRowFieldValue('Shipping', `$${formatNumber(obj.entry.delivery)}`)}
        ${getTableRowFieldValue('Saved', `- $${formatNumber(obj.entry.totalSaved)}`, true)}
        </table><table style="width: 99%; text-align: right;"><hr/>
        ${getTableRowFieldValue('Total', `$${formatNumber(obj.entry.grandtotal)}`, false, true)}
        </table>`;
    
    let deliveryHtml = '';
    if (delivery) {
        deliveryHtml = `<p><strong>Shipping Method</strong><br/>${delivery.name}<br/></p>`;
    }
    
    const message = `
        <p>
          <img src="${logo}" width="300" />
        </p>
        <p>ORDER #${obj.order_num}</p>
        <p><strong>Order Confirmation</strong></p>
        <p>We have recieved your purchase order.  Please follow the instructions depending on the payment method you want to choose:</p>
        <ul>
        <li><strong>YAPPY</strong><br/>
        Open Banco General application and search in the Yappy directory for our business name <strong>@avenidaZ</strong>.  Complete the payment information and in the comment section add your order number (very important).
        </li>
        <li><strong>Wire Transfer or Deposit at the Bank</strong><br/>
        Make the transfer to: <strong>Grupo Generación Zeta S.A. => Banco General => Cuenta Corriente => Account # 0395011351638</strong>.  Send your proof of payment through email or chat.
        </li>
        </ul>
        <p>
        We will soon enable other payment methods or options
        </p>
        <p>
        Once the payment has been made, we will proceed to process the order and shipment based on the selected choice.
        <p>
        <p>For more information, please contact us at +507 6770-2440.</p>
        <p>Thank you for choosing us!</p>
        <p><strong>Avenida Z</strong></p>
        <p><a target="_blank" href='${mainUrl}'>View your order</a></p>
        <hr/>
        <p>
          <strong>Client Information</strong>
        </p>
        <p>
          <strong>Shipping Address</strong><br/>
          ${obj.entry.shipping_name}<br/>
          ${obj.entry.shipping_address}<br/>
          ${obj.entry.shipping_district}<br/>
          ${obj.entry.shipping_corregimiento}<br/>
          ${obj.entry.shipping_province}<br/>
          ${obj.entry.shipping_country}<br/><br/>
          Teléfono: ${obj.entry.shipping_phone}<br/>
        </p>
        <hr/>
        <p><strong>Order Summary</strong></p>
        ${cartHtml}
        ${totalHtml}
        ${deliveryHtml}`;
    return message;
}

module.exports = {
    getTemplateText
}
