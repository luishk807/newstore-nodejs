const assert = require('assert');
const sequelize = require('../../src/pg/sequelize');
const { PurchaseOrder, PurchaseOrderItem } = require('../../src/pg/models/PurchaseOrder');
const purchaseOrderService = require('../../src/services/purchaseOrder.service');
const qbPurchaseOrder = {
    "PurchaseOrder": {
        "ShipAddr": {
            "Id": "113",
            "Line1": "Sandbox Company_US_1",
            "Line2": "123 Sierra Way",
            "Line3": "San Pablo, CA  87999 US"
        },
        "PrintStatus": "NotSet",
        "EmailStatus": "NotSet",
        "POStatus": "Open",
        "domain": "QBO",
        "sparse": false,
        "Id": "166",
        "SyncToken": "0",
        "MetaData": {
        "CreateTime": "2021-09-11T10:48:24-07:00",
        "LastUpdatedTime": "2021-09-11T10:48:24-07:00"
        },
        "CustomField": [
            {
                "DefinitionId": "1",
                "Name": "Crew #",
                "Type": "StringType"
            },
            {
                "DefinitionId": "2",
                "Name": "Sales Rep",
                "Type": "StringType"
            }
        ],
        "DocNumber": "1022",
        "TxnDate": "2021-09-11",
        "CurrencyRef": {
            "value": "USD",
            "name": "United States Dollar"
        },
        "LinkedTxn": [],
        "Line": [
            {
                "Id": "1",
                "LineNum": 1,
                "Description": "Purchased from test vendor",
                "Amount": 0.5,
                "DetailType": "ItemBasedExpenseLineDetail",
                "ItemBasedExpenseLineDetail": {
                "BillableStatus": "NotBillable",
                "ItemRef": {
                    "value": "19",
                    "name": "Test Product"
                },
                "UnitPrice": 0.5,
                "Qty": 1,
                "TaxCodeRef": {
                    "value": "NON"
                }
                }
            }
        ],
        "VendorRef": {
            "value": "33",
            "name": "Chin's Gas and Oil"
        },
        "APAccountRef": {
            "value": "33",
            "name": "Accounts Payable (A/P)"
        },
        "TotalAmt": 0.5
    },
    "time": "2021-09-11T10:48:46.783-07:00"
};

describe('PurchaseOrder model tests', function() {

    it('should create PurchaseOrder', function(done) {
        this.timeout(20000);
        PurchaseOrder.create({
            amount: 1.0,
            external_id: 'test',
            external_json: '{ "hi": 1 }',
            reference_name: 'test',
            created_at: new Date()
        }, { fields: ['amount', 'external_id', 'external_json', 'reference_name', 'created_at'] })
        .then(result => {
            assert.ok(result);
            done();
        })
        .catch(error => {
            console.error(error);
            assert.fail('Error creating PurchaseOrder');
        })
    });

    it('should get test PurchaseOrders', function(done) {
        this.timeout(20000);
        PurchaseOrder.findAll({ where: { external_id: 'test' }, include: [PurchaseOrderItem]})
        .then(result => {
            console.log(result);
            assert.ok(result);
            done();
        })
        .catch(error => {
            console.error(error)
            assert.fail('Error getting test PurchaseOrder');
        })
    });

    it('should create PurchaseOrder with PurchaseOrderItems', async function() {
        this.timeout(10000);

        const t = await sequelize.transaction();
        try {
            const purchaseOrder = await PurchaseOrder.create({
                amount: 1.0,
                external_id: 'testWithItems',
                external_json: '{ "hi": 1 }',
                reference_name: 'test',
                created_at: new Date()
            }, {
                transaction: t,
                fields: ['amount', 'external_id', 'external_json', 'reference_name', 'created_at']
            });

            console.log('PurchaseOrder', purchaseOrder);

            const purchaseOrderItems = await PurchaseOrderItem.bulkCreate([
                {
                    purchase_order_id: purchaseOrder.id,
                    sku: 'test-001',
                    qty: 8,
                    unit_price: 1.00,
                    amount: 8.00
                },
                {
                    purchase_order_id: purchaseOrder.id,
                    sku: 'test-002',
                    qty: 7,
                    unit_price: 2.00,
                    amount: 14.00
                }
            ], { transaction: t, fields: ['purchase_order_id', 'sku', 'qty', 'unit_price'] });

            console.log(purchaseOrderItems);
            await t.commit();
            assert.ok(purchaseOrder);
            assert.equal(purchaseOrderItems.length > 0, true);
        } catch (error) {
            console.log(error);
            await t.rollback();
            assert.fail('Error creating PurchaseOrder with PurchaseOrderItems');
        }

    });

    it('should get test PurchaseOrders with PurchaseOrderItems', function(done) {
        this.timeout(20000);
        PurchaseOrder.findAll({ where: { external_id: 'testWithItems' }, include: [PurchaseOrderItem]})
        .then(result => {
            console.log('PurchaseOrder result:', result);
            assert.ok(result);
            done();
        })
        .catch(error => {
            console.error(error)
            assert.fail('Error getting testWithItems PurchaseOrder');
        })
    });

});

describe('PurchaseOrder service tests', function() {

    it('should create a PurchaseOrder with items from PurchaseOrder.Service', async function() {
        const purchaseOrder = {
            amount: 3.00,
            externalId: 'serviceTest',
            externalJSON: '{}',
            referenceName: 'REFERENCE',
            items: [{
                sku: 'test-SRV001',
                qty: 8,
                unitPrice: 1.00,
                amount: 8.00
            },
            {
                sku: 'test-SRV002',
                qty: 7,
                unitPrice: 2.00,
                amount: 14.00
            }]
        }
        const result = await purchaseOrderService.createPurchaseOrder(purchaseOrder);
        console.log(result);
        assert.notEqual(result, null);
    });

    it('should get test PurchaseOrders with items from PurchaseOrder.Service', async function() {
        try {
            const purchaseOrders = await purchaseOrderService.getPurchaseOrderByQuery({ external_id: 'testWithItems' });
            console.log('PurchaseOrders result:', purchaseOrders);
            assert.equal(purchaseOrders.length > 0, true);
        } catch (error) {
            console.error(error);
            assert.fail('Error getting PurchaseOrders from PurchaseOrder Service');
        }
    });

    // I guess I shouldn't test this because it requires the quickbooks thing
    // it('should save PurchaseOrder locally from Quickbooks integration PurchaseOrder with PurchaseOrder.Service', async function() {
    //     const result = await purchaseOrderService.saveQuickbooksPurchaseOrder(qbPurchaseOrder);
    //     assert.ok(result)
    // })

});
