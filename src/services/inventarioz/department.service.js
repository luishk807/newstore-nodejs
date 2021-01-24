const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getDepartments = () => {
    return prisma.department.findMany({})
}

const saveDepartment = (value) => {
    return prisma.department.create({
        data: {
            name: value.name,
            description: value.description
        }
    })
}

module.exports = {
    getDepartments,
    saveDepartment
}
