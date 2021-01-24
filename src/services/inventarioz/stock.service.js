const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/** Creates a stock registry for the product variant */
const createStock = ({ product_id, product_variant_id }) => {
    const productConnect = { connect: { id: product_id } };
    let create = {
        data: {
            product: productConnect
        }
    }
    // If product_variant_id is not null then it will connect
    if (product_variant_id) {
        const productVariantConnect = { product_variant: { connect: { id: product_variant_id } } };
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



module.exports = {
    createStock,
    getStock
}
