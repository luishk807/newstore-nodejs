const service = require('../../services/inventarioz/account.service');

const authenticate = (username, password) => {
    return service.authenticate(username, password)
}

module.exports = {
    authenticate
}
