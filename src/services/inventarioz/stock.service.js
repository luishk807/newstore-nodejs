const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getProductConnect = (product_id, simpleIdMode = false) => {
    if (product_id) {
        if (!simpleIdMode) {
            return { product: { connect: { id: product_id } } }
        } else {
            return { product_id: product_id }
        }
    }
    return null;
}

const getProductVariantConnect = (product_variant_id, simpleIdMode = false) => {
    if (product_variant_id) {
        if (!simpleIdMode) {
            return { product_variant: { connect: { id: product_variant_id } } }
        } else {
            return { product_variant_id: product_variant_id }
        }
    }
    return null;
}

const getSupplierConnect = (supplier_id, simpleIdMode = false) => {
    if (supplier_id) {
        if (!simpleIdMode) {
            return { supplier: { connect: { id: supplier_id } } }
        } else {
            return { supplier_id: supplier_id }
        }
    }
    return null;
}

const getWarehouseConnect = (warehouse_id, simpleIdMode = false) => {
    if (warehouse_id) {
        if (!simpleIdMode) {
            return { warehouse: { connect: { id: warehouse_id } } }
        } else {
            return { warehouse_id: warehouse_id }
        }
    }
    // When not given, will default to id 1. We must have at least this default warehouse entry on the database
    return { warehouse_id: 1 }
    // BUG: This is causing infinite warehouse creation, since where id = 1 never matches
    // it will always create new warehouse with the name of 'Main'
    // return { warehouse: { connectOrCreate: {
    //     where: { id: 1 },
    //     create: { name: 'Main' }
    // } } }
}

/** Creates a stock registry for the product variant */
// const createStock = ({ product_id, product_variant_id }) => {
//     const productConnect = getProductConnect(product_id);
//     let create = {
//         data: {
//             ...productConnect
//         }
//     }
//     // If product_variant_id is not null then it will connect
//     if (product_variant_id) {
//         const productVariantConnect = getProductVariantConnect(product_variant_id);
//         create.data = { ...create.data, ...productVariantConnect }
//     }
    
//     return prisma.stock.create(create);
// }

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
                },
                // stock_entry: true
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
    warehouse_id
}) => {
    if (product_id && product_variant_id && unit_cost && unit_price && purchase_date && !isNaN(quantity)) {
        const productConnect = getProductConnect(product_id, true);
        const productVariantConnect = getProductVariantConnect(product_variant_id, true);
        const supplierConnect = getSupplierConnect(supplier_id, true); // Supplier is required for now, maybe it has to be optional
        const warehouseConnect = getWarehouseConnect(warehouse_id);
        let create = { data: {
                unit_cost: +unit_cost,
                unit_price: +unit_price,
                reference: reference,
                expiration_date: (expiration_date) ? new Date(expiration_date) : null,
                purchase_date: (purchase_date) ? new Date(purchase_date) : null,
                quantity: +quantity,
                supplier_invoice_ref: supplier_invoice_ref,
                supplier_sku: supplier_sku,
                created_at: new Date(),
                ...productConnect,
                ...productVariantConnect,
                ...supplierConnect,
                ...warehouseConnect // Could it be that all these connects needs to go at the end?
            }
        }
        return prisma.stock_entry.create(create);
    }
    throw 'Missing required parameters for adding stock entry';
}

module.exports = {
    // createStock,
    getStock,
    addStockEntry
}
