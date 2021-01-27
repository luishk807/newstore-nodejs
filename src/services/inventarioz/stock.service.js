const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getProductConnect = (product_id) => {
    if (product_id) {
        return { product: { connect: { id: product_id } } }
    }
    return null;
}

const getProductVariantConnect = (product_variant_id) => {
    if (product_variant_id) {
        return { product_variant: { connect: { id: product_variant_id } } }
    }
    return null;
}

const getSupplierConnect = (supplier_id) => {
    if (supplier_id) {
        return { supplier: { connect: { id: supplier_id } } }
    }
    return null;
}

const getStockConnect = (stock_id) => {
    if (stock_id) {
        return { stock: { connect: { id: stock_id } } }
    }
    return null;
}

const getWarehouseConnectOrCreate = (warehouse_id) => {
    if (warehouse_id) {
        return { warehouse: { connect: { id: warehouse_id } } }
    }
    return { warehouse: { connectOrCreate: {
        where: { id: 1 },
        create: { name: 'Main' }
    } } }
}

/** Creates a stock registry for the product variant */
const createStock = ({ product_id, product_variant_id }) => {
    const productConnect = getProductConnect(product_id);
    let create = {
        data: {
            ...productConnect
        }
    }
    // If product_variant_id is not null then it will connect
    if (product_variant_id) {
        const productVariantConnect = getProductVariantConnect(product_variant_id);
        create.data = { ...create.data, ...productVariantConnect }
    }
    
    return prisma.stock.create(create);
}

const getStock = ({ product_id, product_variant_id }) => {
    let where = null;
    if (product_id) {
        where = {
            product_id: product_id, // Have to make these conditionals
            product_variant_id: product_variant_id
        }
    } else if (product_variant_id) {
        where = {
            product_variant_id: product_variant_id
        }
    }
    if (where) {
        return prisma.stock.findMany({
            where: where,
            include: {
                product_variant: {
                    include: {
                        option: true,
                        option_value: true
                    }
                }
            }
        });
    }
    return { data: [], error: 'No valid ids given' }
}

const addStockEntry = ({
    product_id,
    product_variant_id,
    unit_cost,
    unit_price,
    reference,
    expiration_date,
    purchase_date,
    supplier_id,
    supplier_invoice_ref,
    supplier_sku,
    quantity,
    stock_id,
    warehouse_id
}) => {
    if (product_id && product_variant_id && stock_id && unit_cost && unit_price && purchase_date && !isNaN(quantity)) {
        const productConnect = getProductConnect(product_id);
        const productVariantConnect = getProductVariantConnect(product_variant_id);
        const supplierConnect = getSupplierConnect(supplier_id); // Supplier is required for now, maybe it has to be optional
        const stockConnect = getStockConnect(stock_id);
        const warehouseConnect = getWarehouseConnectOrCreate(warehouse_id);
        let create = { data: {
                ...productConnect, ...productVariantConnect, ...supplierConnect, ...stockConnect, ...warehouseConnect,
                unit_cost: +unit_cost,
                unit_price: +unit_price,
                reference: reference,
                expiration_date: (expiration_date) ? new Date(expiration_date) : null,
                purchase_date: (purchase_date) ? new Date(purchase_date) : null,
                quantity: +quantity,
                supplier_invoice_ref: supplier_invoice_ref,
                supplier_sku: supplier_sku,
                created_at: new Date()
            } 
        }
        return prisma.stock_entry.create(create);
    }
    throw 'Missing required parameters for adding stock entry';
}

module.exports = {
    createStock,
    getStock,
    addStockEntry
}
