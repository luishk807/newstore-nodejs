const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getCategories = () => {
    return prisma.category.findMany({})
}

const saveCategory = (value) => {
    return prisma.category.create({
        data: {
            name: value.name
        }
    })
}

module.exports = {
    getCategories,
    saveCategory
}
