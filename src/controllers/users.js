const service = require('../services/user.service');

const findById = (id) => {
    return service.findById(id);
}

const deleteUser = (id) => {
    return service.deleteById(id);
}

const create = (user, file) => {
    return service.create(user, file);
}

module.exports = {
    findById,
    deleteUser,
    create
}
