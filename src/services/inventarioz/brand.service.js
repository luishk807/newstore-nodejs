const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getBrands = () => {
    return prisma.brand.findMany({})
}

const saveBrand = (value) => {
    return prisma.brand.create({
        data: {
            name: value.name
        }
    })
}

module.exports = {
    getBrands,
    saveBrand
}
