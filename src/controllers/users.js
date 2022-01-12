const service = require('../services/user.service');

module.exports = {
    findById: service.findById,
    isEmailTaken: service.isEmailTaken,
    deleteById: service.deleteById,
    create: service.create,
    getAllUsers: service.getAllUsers,
    update: service.update
}