const userAddress = require('../services/userAddress.service');

module.exports = {
    createUserAdress: userAddress.createUserAdress,
    createUserAdressByUserId: userAddress.createUserAdressByUserId,
    getUserAdressById: userAddress.getUserAdressById,
    deleteUserAdressById: userAddress.deleteUserAdressById,
    softDeleteUserAdressById: userAddress.softDeleteUserAdressById,
    saveUserAdress: userAddress.saveUserAdress,
    getUserAdressByUserId: userAddress.getUserAdressByUserId,
    getUserAdresses: userAddress.getUserAdresses,
    getUserAdressesByIdAndUser: userAddress.getUserAdressesByIdAndUser,
    getActiveUserAdressById: userAddress.getActiveUserAdressById,
    getActiveUserAdresses: userAddress.getActiveUserAdresses,
    getActiveUserAdressesByIdAndUser: userAddress.getActiveUserAdressesByIdAndUser,
    getActiveUserAdressByUserId: userAddress.getActiveUserAdressByUserId,
    checkValidUser: userAddress.checkValidUser,
    setFavoriteAddressByUser: userAddress.setFavoriteAddressByUser
}
