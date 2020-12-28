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

module.exports = {
    getOptions,
    saveOptions,
    deleteOption,
    saveOptionsValue
}
