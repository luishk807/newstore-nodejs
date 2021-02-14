const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const searchClient = ({ q }) => {
    if (q) {
        return prisma.client.findMany({
            where: {
                OR: [{
                        first_name: {
                            contains: q,
                            mode: "insensitive"
                        }
                    }, {
                        last_name: {
                            contains: q,
                            mode: "insensitive"
                        }
                    }, {
                        phones: {
                            contains: q,
                            mode: "insensitive"
                        }
                    }, {
                        email: {
                            contains: q,
                            mode: "insensitive"
                        }
                    }
                ]
            },
            include: {
                client_address: true
            }
        })
    }
    return []
}

const saveClient = ({ first_name, last_name, phones, email, client_address }) => {
    return prisma.client.create({
        include: {
            client_address: true
        },
        data: {
            first_name,
            last_name,
            phones,
            email,
            client_address: {
                create: client_address
            }
        }
    })
}

const getClient = (id) => {
    return prisma.client.findUnique({
        where: {
            id: id
        },
        include: {
            client_address: true
        }
    })
}

module.exports = {
    searchClient,
    saveClient,
    getClient
}
