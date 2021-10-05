const Sequelize = require('sequelize');
const pgconfig = require('../config')
const sequelize = pgconfig.getSequelize();

const PurchaseOrder = sequelize.define('purchase_order', {
    id: { type: Sequelize.BIGINT, primaryKey: true, allowNull: false, autoIncrement: true },
    amount: { type: Sequelize.DECIMAL },
    reference_name: { type: Sequelize.TEXT },
    external_id: { type: Sequelize.TEXT }, // Used for external integration
    external_json: { type: Sequelize.JSON },
    created_at: { type: Sequelize.DATE }
}, {
    schema: 'public',
    freezeTableName: true,
    timestamps: false,
    underscored: true
});

const PurchaseOrderItem = sequelize.define('purchase_order_item', {
    id: { type: Sequelize.BIGINT, primaryKey: true, allowNull: false, autoIncrement: true },
    purchase_order_id: {
        type: Sequelize.BIGINT,
        references: {
            model: PurchaseOrder,
            key: 'id'
        }
    },
    sku: { type: Sequelize.TEXT },
    qty: { type: Sequelize.INTEGER },
    unit_price: { type: Sequelize.DECIMAL },
    amount: { type: Sequelize.DECIMAL }
}, {
    schema: 'public',
    freezeTableName: true,
    timestamps: false,
    underscored: true
});

// Associations
PurchaseOrder.hasMany(PurchaseOrderItem);
PurchaseOrderItem.belongsTo(PurchaseOrder, { as: 'purchaseOrder', foreignKey: { field: 'purchase_order_id' }, targetKey: 'id' });

module.exports = { 
    PurchaseOrder,
    PurchaseOrderItem
}
