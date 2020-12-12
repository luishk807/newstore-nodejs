const service = require('../services/authentication.service');

const authenticate = async (email, password, onlyAdmin = false) => {
  const result = await service.authenticate(email, password, onlyAdmin);
  return result;
}

module.exports = {
    authenticate
}
