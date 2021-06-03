const UserAddress = require('../pg/models/UserAddresses');
const includes = ['addressesUsers', 'addressCountry', 'addressProvince', 'addressDistrict', 'addressCorregimiento', 'addressZone']; 
const { Op } = require('sequelize');

const deleteUserAdressById = async(id) => {
  return await UserAddress.destroy({
    where: {
      id: id
    }
  })
}

const checkValidUser = async(id, user) => {
  if (user.type != 1) {
    const confirm = await getUserAdressesByIdAndUser(id, user.id);
    if (!confirm) {
      return false;
    }
  }
  return true;
}

const createUserAdress = async (obj) => {
  const body = obj.body;
  const user = obj.body && obj.body.user ? obj.body.user : obj.user.id;
  let selected = body.selected ? body.selected : null;
  if (body.selected) {
    await UserAddress.update(
      {
        'selected': null
      },
      {
        where: {
          userId: user
        }
      }
    )
  }
  
  return await UserAddress.create({
    'address': body.address,
    'addressB': body.addressB,
    'note': body.note,
    'name': body.name,
    'zip': body.zip,
    'user': user,
    'country': body.country,
    'phone': body.phone,
    'mobile': body.mobile,
    'email': body.email,
    'selected': selected,
    'province': body.province,
    'district': body.district,
    'zone': body.zone,
    'note': body.note,
    'corregimiento': body.corregimiento,
  });
}

const saveUserAdress = async(obj, id) => {
  if (obj.favorite) {
    return await UserAddress.update({'selected': true }, { where: { id: obj.favorite, userId: obj.user }});
  } else if (obj.unfavorite) {
    return await UserAddress.update({'selected': null},{ where: { id: obj.unfavorite }});
 } else {
   console.log(obj, 'and', id, 'user', )
    const user = obj && obj.user ? obj.user : null;
    return await UserAddress.update(
      {
        'address': obj.address,
        'addressB': obj.addressB,
        'note': obj.note,
        'name': obj.name,
        'zip': obj.zip,
        'user': user,
        'email': obj.email,
        'country': obj.country,
        'phone': obj.phone,
        'mobile': obj.mobile,
        'province': obj.province,
        'district': obj.district,
        'zone': obj.zone,
        'note': obj.note,
        'corregimiento': obj.corregimiento,
      },
      {
        where: {
          id: id
        }
      }
    )
  }
}

const getUserAdressById = async(id) => {
  return await UserAddress.findOne({ where: { id: id }, include: includes});
}

const getUserAdressByUserId = async(id) => {
  return await UserAddress.findAll({ where: { userId: id }, include: includes});
}

const getUserAdresses = async(id) => {
  return await UserAddress.findAll({ include: includes});
}

const getUserAdressesByIdAndUser = async(id, user) => {
  return await UserAddress.findOne({ where: { id: id, userId: user }, include: includes});
}

module.exports = {
    deleteUserAdressById,
    createUserAdress,
    saveUserAdress,
    getUserAdressById,
    getUserAdressByUserId,
    getUserAdresses,
    getUserAdressesByIdAndUser,
    checkValidUser
}
