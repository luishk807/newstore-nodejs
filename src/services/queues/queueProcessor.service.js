const queueService = require('./queue.service');
const QuickbooksService = require('../integration/quickbooks.node.service');
const { integrationExists, INTEGRATIONS } = require('../integration.service');
const { getGlobalLogger } = require('../../utils/logger.utils');
const logger = getGlobalLogger();
const TOPICS = require('../../constants/queueTopics');
const CONSTANTS = Object.freeze({
    PURCHASE_ORDER: 'PurchaseOrder',
    BILL: 'Bill'
});
const purchaseOrderService = require('../../services/purchaseOrder.service');
const productItemService = require('../../services/productItem.service');
const productStockService = require('../../services/product.stock.service');

class QuickbooksQueueProcessor {
    #quickbooksService = null;

    constructor() {}

    async init() {
        logger.info('Initializing Quickbooks Queue Processor');
        const exists = await integrationExists(INTEGRATIONS.QUICKBOOKS);
        if (exists) {
            this.#quickbooksService = new QuickbooksService();
            await this.#quickbooksService.init();
        } else {
            logger.warn('Quickbooks integration entry does not exist in database');
        }
        logger.info(`Subscribing to topic: ${TOPICS.QUICKBOOKS_WEBHOOK}`);
        // Important to bind the object, or the queue won't know who 'this' is
        queueService.subscribe(TOPICS.QUICKBOOKS_WEBHOOK, this.#processEvent.bind(this));
    }

    /** Wrap processing functions in a try/catch in order to handle job errors */
    async wrapJob(processFunc, job) {
        if (typeof processFunc === 'function') {
            try {
                await processFunc(job.data);
                job.done();
            } catch (error) { // Fail the job if any errors
                logger.error('Catching error from queue process function');
                logger.error(error);
                job.done(error);
                // Republish for retry?
                logger.warn(`Republishing ${job.data.name} due to job fail`);
                queueService.publish(TOPICS.QUICKBOOKS_WEBHOOK, job.data, { retryLimit: 2, retryDelay: 60 });
            }
        } else {
            job.error('No process function specified for job');
        }
    }

    async #processEvent(job) {
        logger.info('Processing job from queue service');
        logger.info(JSON.stringify(job));
        if (job.data) {
            switch (job.data.name) {
                case CONSTANTS.PURCHASE_ORDER:
                    logger.info('PurchaseOrder processing...');
                    this.wrapJob(this.#processPurchaseOrder.bind(this), job); // Important to bind to the correct context
                    break;
                case CONSTANTS.BILL:
                    logger.info('Bill processing...');
                    this.wrapJob(this.#processBill.bind(this), job); // Important to bind to the correct context
                    break;
                default:
                    logger.info(`Not processing event name ${job.data.name}#${job.data.operation}`);
                    return null;
            }
        }
        
    }

    // {
    //     "PurchaseOrder": {
    //       "ShipAddr": {
    //         "Id": "113",
    //         "Line1": "Sandbox Company_US_1",
    //         "Line2": "123 Sierra Way",
    //         "Line3": "San Pablo, CA  87999 US"
    //       },
    //       "PrintStatus": "NotSet",
    //       "EmailStatus": "NotSet",
    //       "POStatus": "Open",
    //       "domain": "QBO",
    //       "sparse": false,
    //       "Id": "166",
    //       "SyncToken": "0",
    //       "MetaData": {
    //         "CreateTime": "2021-09-11T10:48:24-07:00",
    //         "LastUpdatedTime": "2021-09-11T10:48:24-07:00"
    //       },
    //       "CustomField": [
    //         {
    //           "DefinitionId": "1",
    //           "Name": "Crew #",
    //           "Type": "StringType"
    //         },
    //         {
    //           "DefinitionId": "2",
    //           "Name": "Sales Rep",
    //           "Type": "StringType"
    //         }
    //       ],
    //       "DocNumber": "1022",
    //       "TxnDate": "2021-09-11",
    //       "CurrencyRef": {
    //         "value": "USD",
    //         "name": "United States Dollar"
    //       },
    //       "LinkedTxn": [],
    //       "Line": [
    //         {
    //           "Id": "1",
    //           "LineNum": 1,
    //           "Description": "Purchased from test vendor",
    //           "Amount": 0.5,
    //           "DetailType": "ItemBasedExpenseLineDetail",
    //           "ItemBasedExpenseLineDetail": {
    //             "BillableStatus": "NotBillable",
    //             "ItemRef": {
    //               "value": "19",
    //               "name": "Test Product"
    //             },
    //             "UnitPrice": 0.5,
    //             "Qty": 1,
    //             "TaxCodeRef": {
    //               "value": "NON"
    //             }
    //           }
    //         }
    //       ],
    //       "VendorRef": {
    //         "value": "33",
    //         "name": "Chin's Gas and Oil"
    //       },
    //       "APAccountRef": {
    //         "value": "33",
    //         "name": "Accounts Payable (A/P)"
    //       },
    //       "TotalAmt": 0.5
    //     },
    //     "time": "2021-09-11T10:48:46.783-07:00"
    //   }

    // {
    //     "Bill": {
    //      "DueDate": "2021-09-11",
    //      "Balance": 7,
    //      "domain": "QBO",
    //      "sparse": false,
    //      "Id": "176",
    //      "SyncToken": "0",
    //      "MetaData": {
    //       "CreateTime": "2021-09-11T12:46:59-07:00",
    //       "LastUpdatedTime": "2021-09-11T12:46:59-07:00"
    //      },
    //      "TxnDate": "2021-09-11",
    //      "CurrencyRef": {
    //       "value": "USD",
    //       "name": "United States Dollar"
    //      },
    //      "LinkedTxn": [
    //       {
    //        "TxnId": "167",
    //        "TxnType": "PurchaseOrder"
    //       }
    //      ],
    //      "Line": [
    //       {
    //        "Id": "1",
    //        "LineNum": 1,
    //        "Description": "Purchased from test vendor",
    //        "Amount": 0.5,
    //        "LinkedTxn": [
    //         {
    //          "TxnId": "167",
    //          "TxnType": "PurchaseOrder",
    //          "TxnLineId": "1"
    //         }
    //        ],
    //        "DetailType": "ItemBasedExpenseLineDetail",
    //        "ItemBasedExpenseLineDetail": {
    //         "BillableStatus": "NotBillable",
    //         "ItemRef": {
    //          "value": "19",
    //          "name": "Test Product"
    //         },
    //         "UnitPrice": 0.5,
    //         "Qty": 1,
    //         "TaxCodeRef": {
    //          "value": "NON"
    //         }
    //        }
    //       },
    //       {
    //        "Id": "2",
    //        "LineNum": 2,
    //        "Description": "2 cubic ft. bag",
    //        "Amount": 6.5,
    //        "LinkedTxn": [
    //         {
    //          "TxnId": "167",
    //          "TxnType": "PurchaseOrder",
    //          "TxnLineId": "2"
    //         }
    //        ],
    //        "DetailType": "ItemBasedExpenseLineDetail",
    //        "ItemBasedExpenseLineDetail": {
    //         "BillableStatus": "NotBillable",
    //         "ItemRef": {
    //          "value": "15",
    //          "name": "Soil"
    //         },
    //         "UnitPrice": 6.5,
    //         "Qty": 1,
    //         "TaxCodeRef": {
    //          "value": "NON"
    //         }
    //        }
    //       }
    //      ],
    //      "VendorRef": {
    //       "value": "33",
    //       "name": "Chin's Gas and Oil"
    //      },
    //      "APAccountRef": {
    //       "value": "33",
    //       "name": "Accounts Payable (A/P)"
    //      },
    //      "TotalAmt": 7
    //     },
    //     "time": "2021-09-11T12:53:38.436-07:00"
    //    }
    /**
     * PurchaseOrder to adding stock goes through this Quickbooks workflow
     * 1. A PurchaseOrder is created, that means we will get a PurchaseOrder Create event
     * 2. A Bill needs to be created that links to the PurchaseOrder (Copy to Bill option in Expenses).
     *    So we get a Bill Create event.
     * 3. Expenting an Item update event, but we don't receive it, and dev has mentioned that they don't get it
     * @param {*} data 
     */
    async #processPurchaseOrder(data) {
        logger.info('Processing PurchaseOrder...', data);
        switch (data.operation) {
            case 'Create':
                if (this.#quickbooksService) {
                    logger.info('Processing PurchaseOrder Create event');
                    try {
                        const purchaseOrderId = data.id;
                        const purchaseOrder = await this.#quickbooksService.getPurchaseOrder(purchaseOrderId);
                        logger.debug('Purchase order retrieved', purchaseOrder);
                        const savedPurchaseOrder = await purchaseOrderService.saveQuickbooksPurchaseOrder(purchaseOrder, this.#quickbooksService.getItem.bind(this.#quickbooksService))
                        logger.info('Saved local purchase order', savedPurchaseOrder);
                    } catch (error) {
                        logger.error('Error processing PurchaseOrder Create event');
                        logger.error(error);
                        // Throw so it can handled by the wrapper and reject or fail the job
                        throw Error('Error processing PurchaseOrder Create event');
                    }
                }
                break;
            default:
                logger.info(`No processing PurchaseOrder operation ${data.operation}`);
        }
    }

    async #processBill(data) {
        logger.info('Processing Bill...', data);
        switch (data.operation) {
            case 'Create':
                if (this.#quickbooksService) {
                    logger.info('Processing Bill Create event');
                    const billId = data.id;
                    const bill = await this.#quickbooksService.getBill(billId);
                    logger.debug('Bill retrieved', bill);
                    if (bill) {
                        // Check if there is a linked PurchaseOrder
                        if (bill.Bill && bill.Bill.LinkedTxn) {
                            const linkedReference = bill.Bill.LinkedTxn;
                            const purchaseOrderLink = linkedReference.find(l => l.TxnType === CONSTANTS.PURCHASE_ORDER);
                            // There there is a reference link to a PurchaseOrder type
                            if (purchaseOrderLink) {
                                logger.info(`PurchaseOrder with Id: ${purchaseOrderLink.TxnId} reference found in Bill`);
                                // Get PurchaseOrder through external id
                                let localPurchaseOrder = await purchaseOrderService.getPurchaseOrderByQuery({ external_id: purchaseOrderLink.TxnId });
                                logger.info('PurchaseOrder from local db', localPurchaseOrder);
                                if (localPurchaseOrder.length && localPurchaseOrder.length === 1) { // If it exists in local database
                                    localPurchaseOrder = localPurchaseOrder[0]; // Get the single result
                                    logger.info('PurchaseOrder found on local database', localPurchaseOrder);
                                    const localPurchaseOrderItems = localPurchaseOrder.purchase_order_items;
                                    const skus = localPurchaseOrderItems.map(poi => poi.sku);
                                    const productItems = await productItemService.getProductItemsBySkus(skus);
                                    const stockUpdateProductItems = [];
                                    for (let n=0; n<localPurchaseOrderItems.length; ++n) {
                                        const poi = localPurchaseOrderItems[n];
                                        // Find local product item with the same sku from purchase order
                                        const pi = productItems.find(pi => pi.sku === poi.sku);
                                        // Found, then update stock
                                        if (pi) {
                                            stockUpdateProductItems.push({
                                                id: pi.id,
                                                sku: pi.sku,
                                                qty: +poi.qty,
                                                reference: 'PurchaseOrder:' + localPurchaseOrder.id
                                            });
                                        }
                                    }
                                    const result = await productStockService.incrementStocks(stockUpdateProductItems, {});
                                    if (result.length === 0) {
                                        throw Error('Error incrementing stocks, please check the logs');
                                    }
                                    logger.info('Product items update based on PurchaseOrder result', result);
                                    return result;
                                } else {
                                    logger.info('PurchaseOrder Getting PurchaseOrder from Quickbooks API');
                                    localPurchaseOrder = await this.#quickbooksService.getPurchaseOrder(purchaseOrderLink.TxnId);
                                    logger.info('PurchaseOrder retrieved from Quickbooks', localPurchaseOrder);
                                    logger.warn('Updating stock from non existing local PurchaseOrder not supported yet!')
                                }
                            } else {
                                logger.warn('No PurchaseOrder reference in Bill');
                                return null;
                            }
                        } else {
                            logger.warn('No reference link in Bill');
                            return null;
                        }
                    }
                }
                break;
            default:
                logger.info(`No processing Bill operation ${data.operation}`);
                return null;
        }
    }

    async shutdown() {
        return queueService.unsubscribe(TOPICS.QUICKBOOKS_WEBHOOK);
    }
}

const qbQueueProcessor = new QuickbooksQueueProcessor();

module.exports = qbQueueProcessor;
