const service = require('../../services/inventarioz/account.service');

const createAccount = (username, password) => {
    return service.createAccount(username, password)
}

module.exports = {
    createAccount
}
