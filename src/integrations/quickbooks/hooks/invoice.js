const QuickbooksService = require('../../../services/integration/quickbooks.node.service');
const { getCustomerRef, saveInvoiceRef } = require('../../../services/integration/quickbooksRef.service');
const { integrationExists, INTEGRATIONS } = require('../../../services/integration.service');
const log = global.logger;

function createInvoiceLine(item) {
    return {
        DetailType: 'SalesItemLineDetail',
        Amount: 0,
        SalesItemLineDetail: {
            ItemRef: {
                name: '',
                value: 0
            },
            Qty: 0, // Optional
            UnitPrice: 0 // Optional
        },
        Description: '', // Optional
    }
}

function convertOrderToInvoice(order, customerRefId) {
    const invoice = {
        Line: [],
        CustomerRef: {
            value: customerRefId
        }
    }
    log.info(order);
    // {
    //     entry: {
    //       subtotal: '33.00',
    //       grandtotal: '35.31',
    //       tax: '2.31',
    //       totalSaved: 0,
    //       delivery: 0,
    //       coupon: 0,
    //       shipping_name: 'lol',
    //       shipping_address: null,
    //       shipping_email: 'dstevey@hotmail.com',
    //       shipping_city: null,
    //       shipping_country: 'Panama',
    //       shipping_phone: 'lololol',
    //       shipping_province: null,
    //       shipping_township: null,
    //       shipping_corregimiento: null,
    //       shipping_zip: null,
    //       shipping_zone: null,
    //       shipping_district: null,
    //       shipping_note: null,
    //       deliveryOptionId: '1',
    //       deliveryOption: 'Retiro en nuestro deposito.  Plaza El Dorado',
    //       paymentOptionId: '2',
    //       paymentOption: 'Yappy - Banco General',
    //       userId: '26'
    //     },
    //     orderId: '296',
    //     order_num: '1627530214941296',
    //     cart: [
    //       {
    //         orderId: '296',
    //         productItemId: '2595',
    //         unit_total: '3.00',
    //         name: 'Cajas de regalo resistentes con tapa y lazo (crema con lazo rojo vino)',
    //         description: 'Cajas de regalo con detalles elegantes, puede elegir el set completo 3 piezas con los 3 tamaños(chico, mediano y grande) o  individual. *Largo x Ancho x Alto*\n' +
    //           '1. Chico 23.5 x 16x 6 cm\n' +
    //           '2. Mediano 28 x 20 x 8.5 cm\n' +
    //           '3. Grande 32 x 24 x 11.5cm',
    //         model: 'test',
    //         color: 'Verde Cana',
    //         sku: 'test',
    //         product: '2226',
    //         size: 'lg',
    //         code: 'test',
    //         productDiscount: null,
    //         originalPrice: undefined,
    //         savePercentageShow: undefined,
    //         savePercentage: undefined,
    //         savePrice: undefined,
    //         category: 9,
    //         quantity: 3,
    //         total: 9,
    //         brand: 29
    //       },
    //       {
    //         orderId: '296',
    //         productItemId: '2596',
    //         unit_total: '12.00',
    //         name: 'Caja cuadrado armable de micro-corrugado kraft con tapa (33 x31x9.5 cm) Test tes tes tes',
    //         description: 'Sd',
    //         model: 'SW1320',
    //         color: 'Rojo Vino',
    //         sku: 'SW1320-1',
    //         product: '2666',
    //         size: '30x20x8.5cm',
    //         code: 'SW1320-1',
    //         productDiscount: null,
    //         originalPrice: undefined,
    //         savePercentageShow: undefined,
    //         savePercentage: undefined,
    //         savePrice: undefined,
    //         category: 7,
    //         quantity: 2,
    //         total: 24,
    //         brand: 16
    //       }
    //     ],
    //     clientEmail: 'dstevey@hotmail.com'
    // }
    console.log(order);
    return {}
}

async function createInvoice(order, user) {
    const exists = await integrationExists(INTEGRATIONS.QUICKBOOKS);
    if (exists) {
        const customerRef = await getCustomerRef(user.id);
        if (customerRef) {
            const service = new QuickbooksService();
            const qbCustomerRef = customerRef.external_id;
            const invoice = convertOrderToInvoice(order, qbCustomerRef);
            try {
                await service.init();
                const newInvoice = await service.createInvoice(invoice);
                const invoiceRef = await saveInvoiceRef(orderId, newInvoice.Invoice.Id);
                log.info('Quickbooks Invoice created', { invoice: newInvoice, invoiceRef });
            } catch (error) {
                log.error('Error creating invoice in Quickbooks', error);
            }
        } else {
            log.error(`Cannot create an invoice without a valid customer from Quickbooks, no customer reference found for ${user.id}`);
        }
        
    }
}

async function updateInvoice(order) {

}

async function deleteInvoice(id) {

}

module.exports = {
    createInvoice,
    updateInvoice,
    deleteInvoice
}
