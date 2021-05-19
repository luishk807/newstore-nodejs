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
          <td style='width: 20%'><img style='width: 100px;' src='${imgUrl}' /></td>
          <td style='width: 50%'>
            <p><strong>${item.name}</strong></p>
            <p>SKU: ${item.sku}</p>
            <p>Color: ${item.color}</p>
            <p>Tamaño: ${item.size}</p>
            <p>Cantidad: ${item.quantity}</p>
            <p>Unidad: $${item.unit_total}</p>
            <p>${productDiscount}</p>
          </td>
          <td style='width: 30%'>$${item.total}</td>
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
    return `<tr><td style='width: 50%'>${label}</td><td style='width: 50%'>${htmlValue}</td></tr>`;
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
    
    let totalHtml = `<hr/><table>
        ${getTableRowFieldValue('Subtotal', `$${obj.entry.subtotal}`)}
        ${getTableRowFieldValue('ITBMS 7%', `$${obj.entry.tax}`)}
        ${getTableRowFieldValue('Envío', `$${obj.entry.delivery}`)}
        ${getTableRowFieldValue('Ahorraste', `- $${obj.entry.totalSaved}`, true)}
        </table><table><hr/>
        ${getTableRowFieldValue('Total', `$${obj.entry.grandtotal}`, false, true)}
        </table>`;
    
    let deliveryHtml = '';
    if (delivery) {
        deliveryHtml = `<p><strong>Shipping Method</strong><br/>${delivery.name}<br/></p>`;
    }
    
    const message = `
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
        <p><strong>Resumen de la Orden</strong></p>
        ${cartHtml}
        ${totalHtml}
        <p>
          <strong>Información de Cliente</strong>
        </p>
        <p>
          <strong>Dirección de Envío</strong><br/>
          ${obj.entry.shipping_name}<br/>
          ${obj.entry.shipping_address}<br/>
          ${obj.entry.shipping_district}<br/>
          ${obj.entry.shipping_corregimiento}<br/>
          ${obj.entry.shipping_province}<br/>
          ${obj.entry.shipping_country}<br/><br/>
          Teléfono: ${obj.entry.shipping_phone}<br/>
        </p>
        ${deliveryHtml}`;
    return message;
}

module.exports = {
    getTemplateText
}
