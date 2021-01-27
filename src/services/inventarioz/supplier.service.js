const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const addSupplier = ({name, address, phone}) => {
    return prisma.supplier.create({ data: { name, address, phone} })
}

const getSupplierById = (id) => {
    return prisma.supplier.findUnique({ where: { id: +id }})
}

const getSuppliers = () => {
    return prisma.supplier.findMany({});
}

module.exports = {
    addSupplier,
    getSupplierById,
    getSuppliers
}
