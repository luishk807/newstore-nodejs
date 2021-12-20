const service = require('../services/user.service');

module.exports = {
    findById: service.findById,
    checkEmailAvailable: service.checkEmailAvailable,
    deleteById: service.deleteById,
    create: service.create,
    getAllUsers: service.getAllUsers,
    update: service.update
}