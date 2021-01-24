const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getOptions = () => {
    return prisma.option.findMany({ include: {
        option_value: true
    }})
}

const saveOptions = (option) => {
    return prisma.option.create({ data: option })
}

const deleteOption = (option) => {
    return prisma.option.delete({
        where: {
            id: option.id
        }
    })
}

const saveOptionsValue = (value) => {
    return prisma.option_value.create({
        data: {
            value: value.value,
            option: {
                connect: { id: value.option_id } // Connect this new option value with an existing option with the given id
            }
        }
    })
}

/** 
 * Saves a new product with category and brand with no variant
 * (null variant)
 * @param {*} value Product
 */
const saveProductNullVariant = (value) => {
    return prisma.product.create({
        data: {
            name: value.name,
            description: value.description,
            category_product: { // Create an entry for the product category in the same transaction
                create: [{
                    category: {
                        connect: { id: value.categoryId }
                    }
                }]
            },
            brand_product: {
                create: [{
                    brand: {
                        connect: { id: value.brandId }
                    }
                }]
            },
            department_product: {
                create: [{
                    department: {
                        connect: { id: value.departmentId}
                    }
                }]
            },
            product_variant: { // Create a null variant with the SKU
                create: [{
                    option: undefined,
                    option_value: undefined,
                    sku: value.sku,
                    model: value.model
                }]
            }
        },
        include: {
            product_variant: true
        }
    })
}

const saveProduct = (value) => {
    if (value.name && value.sku && !value.optionId && !value.optionValueId) {
        return saveProductNullVariant(value);
    }
    if (value.id && !value.name && value.optionId && value.optionValueId) {
        return saveProductVariant(value);
    }
    if (value.name && value.sku && value.optionId && value.optionValueId) {
        return prisma.product.create({
            data: {
                name: value.name,
                description: value.description,
                category_product: { // Create an entry for the product category in the same transaction
                    create: [{
                        category: {
                            connect: { id: value.categoryId }
                        }
                    }]
                },
                brand_product: {
                    create: [{
                        brand: {
                            connect: { id: value.brandId }
                        }
                    }]
                },
                department_product: {
                    create: [{
                        department: {
                            connect: { id: value.departmentId}
                        }
                    }]
                },
                product_variant: { // Create a null variant with the SKU
                    create: [{
                        option: {
                            connect: { id: value.optionId }
                        },
                        option_value: {
                            connect: { id: value.optionValueId }
                        },
                        sku: value.sku,
                        model: value.model
                    }]
                }
            },
            include: {
                product_variant: true
            }
        })
    }
    return { error: 'Not enough details to save product', data: null, message: 'Not enough information to save product' }
}

/**
 * Saves only the variant for the product given the id, optionId and optionValueId
 * @param {id, sku, optionId, okptionValueId} value 
 */
const saveProductVariant = (value) => {
    if (value && value.id && value.sku && value.optionId && value.optionValueId) {
        return prisma.product_variant.create({
            data: {
                product: {
                    connect: { id: value.id }
                },
                option: {
                    connect: { id: value.optionId }
                },
                option_value: {
                    connect: { id: value.optionValueId }
                },
                sku: value.sku,
                model: value.model
            }
        })
    }
    return { error: 'Missing required fields for saving product variant', message: 'Missing required fields for saving product variant' }
}

/** Searches product by name and description */
const searchProduct = ({ q, category, department, brand }) => {
    if (q) {
        return prisma.product.findMany({
            where: {
                OR: [{
                    name: {
                            contains: q,
                            mode: "insensitive"
                        }
                    }, {
                    description: {
                            contains: q,
                            mode: "insensitive"
                        }
                    }
                ]
            }
        })
    }
    return []
}

const getProduct = (id) => {
    return prisma.product.findUnique({
        where: {
            id: id
        },
        include: {
            brand_product: true,
            category_product: true,
            department_product: true,
            product_variant: {
                include: {
                    option: true,
                    option_value: true,
                    stock: true
                }
            }
        }
    })
}

const deleteProductVariant = (id) => {
    return prisma.product_variant.delete({
        where: {
            id: id
        }
    })
}

module.exports = {
    getOptions,
    saveOptions,
    deleteOption,
    saveOptionsValue,
    saveProductNullVariant,
    searchProduct,
    getProduct,
    saveProduct,
    saveProductVariant,
    deleteProductVariant
}
