const service = require('../services/user.service');

module.exports = {
    findById: service.findById,
    findAdminById: service.findAdminById,
    findActiveById: service.findActiveById,
    deleteById: service.deleteById,
    trashedUserById: service.trashedUserById,
    create: service.create,
    getAllActiveUsers: service.getAllActiveUsers,
    getAllActiveUsersWithFilters: service.getAllActiveUsersWithFilters,
    getAllUsers: service.getAllUsers,
    update: service.update
}