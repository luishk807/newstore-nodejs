const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

const createHash = (value) => {
    const salt = bcrypt.genSaltSync();
    const pwdHash = bcrypt.hashSync(value, salt);
    return { salt, hash: pwdHash }
}

const createAccount = async (username, password) => {
    const account = await prisma.account.findUnique({
        where: {
            username: username
        }
    });
    if (!account) {
        const newAccount = await prisma.account.create({
            username: username, password: createHash(password).hash
        });
        if (newAccount) {
            return { error: false, data: newAccount }
        }
    }
    return { error: true, message: 'Account already exists' }
}

const authenticate = async (username, password) => {
    const account = await prisma.account.findUnique({
        where: {
            username: username
        }
    });
    if (account) {
        return bcrypt.compareSync(password, account.password);
    }
    return false;
}

module.exports = {
    createHash,
    createAccount,
    authenticate
}
