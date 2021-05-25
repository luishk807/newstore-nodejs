const { formatNumber, checkIfEmpty } = require('../../utils');

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
    return `<table style="width: 99%;">
        <tr>
          <td style="width: 20%; vertical-align: top;"><img style="width: 100px;" src="${imgUrl}" /></td>
          <td style="width: 50%">
            <strong>${item.name}</strong><br/>
            SKU: ${item.sku}<br/>
            Color: ${item.color}<br/>
            Tamaño: ${item.size}<br/>
            Cantidad: ${item.quantity}<br/>
            Unidad: $${item.unit_total}<br/>
            ${productDiscount}
          </td>
          <td style="width: 30%; vertical-align: top; text-align: right;">$${(item.total) ? item.total.toFixed(2) : item.total}</td>
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
    return `<tr><td style="width: 70%">${label}</td><td style="width: 30%">${htmlValue}</td></tr>`;
  }

const getTemplateText = async (obj, { mainUrl, productItems, referer, awsImageUrl, delivery, productSearchFunc, logo }) => {
    let cartHtml = '';
    for (const item of obj.cart) {
        const product = productItems.find(pi => +pi.id === +item.productItemId)
        let productDiscount = '';
        if (item.productDiscount) {
          productDiscount = `Descuento: ${item.productDiscount}`;
        }

        const imgUrl = await getSingleImageUrl(product, { referer, awsUrl: awsImageUrl, productSearchFunc });
        item['imgUrl'] = imgUrl;
    
        // If item is coming from the frontend, it wouldn't be good to use this for showing the information
        // It would be more safe and secure to load that data from the database instead
        cartHtml += getSingleItemHtml(item, { imgUrl, productDiscount });
    }
    
    let totalHtml = `<hr/><table style="width: 99%; text-align: right;">
        ${getTableRowFieldValue('Subtotal', `$${formatNumber(obj.entry.subtotal)}`)}
        ${getTableRowFieldValue('ITBMS 7%', `$${formatNumber(obj.entry.tax)}`)}
        ${getTableRowFieldValue('Envío', `$${formatNumber(obj.entry.delivery)}`)}`
    if (obj.entry.totalSaved && obj.entry.totalSaved > 0) {
      totalHtml += `${getTableRowFieldValue('Ahorraste', `- $${formatNumber(obj.entry.totalSaved)}`, true)}`
    }
    totalHtml += `</table><hr/><table style="width: 99%; text-align: right;">
        ${getTableRowFieldValue('Total', `$${formatNumber(obj.entry.grandtotal)}`, false, true)}
        </table>`;
    
    let deliveryHtml = '';
    if (delivery) {
        deliveryHtml += `<p><strong>Método de Envío</strong><br/>${delivery.name}<br/></p>`;
    }
    
    let message = `
        <p>
          <img src="${logo}" width="300" />
        </p>
        <p>ÓRDEN #${obj.order_num}</p>
        <p><strong>Confirmación de Orden</strong></p>
        <p>Hemos recibido su orden de compra. Debajo se encuentran las opciones disponibles e instrucciones para realizar su pago:</p>
        <ul>
        <li><strong>YAPPY</strong><br/>
        Ingrese a la aplicación de Banco General y busque en el Directorio de Yappy nuestro comercio por <strong>@avenidaZ</strong>.  Complete la información de pago e ingrese en la sección de comentario el número de su orden.
        </li>
        <li><strong>Transferencia Bancaria o Depósito en Taquilla</strong><br/>
        Realizar su pago a nombre de: <strong>Grupo Generación Zeta S.A. => Banco General => Cuenta Corriente => Cuenta # 0395011351638</strong>.  Enviar su comprobante de pago por esta misma vía.
        </li>
        </ul>
        <p>
        Pronto estaremos habilitando otras opciones de pago
        </p>
        <p>
        Una vez realizado su pago, procesaremos su orden y entrega según la opción que fue seleccionado.
        <p>
        <p>Para mayor información contáctanos al 6770-2440.</p>
        <p>¡Gracias por Preferirnos!</p>
        <p><strong>Avenida Z</strong></p>
        <p><a target="_blank" href='${mainUrl}'>Ver su orden</a></p>
        <hr/>
        <p>
          <strong>Información de Cliente</strong>
        </p>`;
        console.log("obj.entry", obj.entry)
      const deliveryOption = Number(obj.entry.deliveryOptionId);
      let addressSend = '';
      console.log("deliveryOption", deliveryOption, ' and ', deliveryOption == 1)
      if (deliveryOption == 1) {
        if (!checkIfEmpty(obj.entry.shipping_name)) {
          addressSend += `${obj.entry.shipping_name}<br/>`;
        }
        if (!checkIfEmpty(obj.entry.shipping_email)) {
          addressSend += `Email: ${obj.entry.shipping_email}<br/>`;
        }
        if (!checkIfEmpty(obj.entry.shipping_phone)) {
          addressSend += `Teléfono: ${obj.entry.shipping_phone}<br/>`;
        }
        message += `
        <p>
          <strong>Información del Cliente</strong><br/>
          ${addressSend}
        </p>`;
      } else {
        if (!checkIfEmpty(obj.entry.shipping_name)) {
          addressSend += `${obj.entry.shipping_name}<br/>`;
        }
        if (!checkIfEmpty(obj.entry.shipping_address)) {
          addressSend += `${obj.entry.shipping_address}<br/>`;
        }
        if (!checkIfEmpty(obj.entry.shipping_district)) {
          addressSend += `${obj.entry.shipping_district}<br/>`;
        }
        if (!checkIfEmpty(obj.entry.shipping_corregimiento)) {
          addressSend += `${obj.entry.shipping_corregimiento}<br/>`;
        }
        if (!checkIfEmpty(obj.entry.shipping_province)) {
          addressSend += `${obj.entry.shipping_province}<br/>`;
        }
        if (!checkIfEmpty(obj.entry.shipping_country)) {
          addressSend += `${obj.entry.shipping_country}<br/>`;
        }
        if (!checkIfEmpty(obj.entry.shipping_email)) {
          addressSend += `Email: ${obj.entry.shipping_email}<br/>`;
        }
        if (!checkIfEmpty(obj.entry.shipping_phone)) {
          addressSend += `Teléfono: ${obj.entry.shipping_phone}<br/>`;
        }
        message += `
        <p>
          <strong>Dirección de Envío</strong><br/>
          ${addressSend}
        </p>`;
      }
      message += `
        <hr/>
        <p><strong>Resumen de la Orden</strong></p>
        ${cartHtml}
        ${totalHtml}
        ${deliveryHtml}`;
    return message;
}

module.exports = {
    getTemplateText
}
