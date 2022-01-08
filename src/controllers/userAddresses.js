const userAddress = require('../services/userAddress.service');

module.exports = {
    createUserAdress: userAddress.createUserAdress,
    getUserAdressById: userAddress.getUserAdressById,
    deleteUserAdressById: userAddress.deleteUserAdressById,
    saveUserAdress: userAddress.saveUserAdress,
    getUserAdressByUserId: userAddress.getUserAdressByUserId,
    getUserAdresses: userAddress.getUserAdresses,
    getUserAdressesByIdAndUser: userAddress.getUserAdressesByIdAndUser,
    checkValidUser: userAddress.checkValidUser,
    setFavoriteAddressByUser: userAddress.setFavoriteAddressByUser
}
