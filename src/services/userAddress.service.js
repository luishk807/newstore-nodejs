const UserAddress = require('../pg/models/UserAddresses');
const includes = ['addressesUsers', 'addressCountry', 'addressProvince', 'addressDistrict', 'addressCorregimiento', 'addressZone']; 
const { checkIfEmpty } = require('../utils');

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
  
  let cleanObj = {}
  for(const key in body) {
    cleanObj[key] = !checkIfEmpty(body[key]) ? body[key] : null;
  }

  return await UserAddress.create({
    'address': cleanObj?.address,
    'addressB': cleanObj?.addressB,
    'note': cleanObj?.note,
    'name': cleanObj?.name,
    'zip': cleanObj?.zip,
    'user': user,
    'country': cleanObj?.country,
    'phone': cleanObj?.phone,
    'mobile': cleanObj?.mobile,
    'email': cleanObj?.email,
    'selected': selected,
    'province': cleanObj?.province,
    'district': cleanObj?.district,
    'zone': cleanObj?.zone,
    'note': cleanObj?.note,
    'corregimiento': cleanObj?.corregimiento,
  });
}

const saveUserAdress = async(obj, id) => {
  if (obj.favorite) {
    return await UserAddress.update({'selected': true }, { where: { id: obj.favorite, userId: obj.user }});
  } else if (obj.unfavorite) {
    return await UserAddress.update({'selected': null},{ where: { id: obj.unfavorite }});
 } else {
    const user = obj && obj.user ? obj.user : null;

    let cleanObj = {}
    for(const key in obj) {
      cleanObj[key] = !checkIfEmpty(obj[key]) ? obj[key] : null;
    }

    return await UserAddress.update(
      {
        'address': cleanObj?.address,
        'addressB': cleanObj?.addressB,
        'note': cleanObj?.note,
        'name': cleanObj?.name,
        'zip': cleanObj?.zip,
        'user': user,
        'email': cleanObj?.email,
        'country': cleanObj?.country,
        'phone': cleanObj?.phone,
        'mobile': cleanObj?.mobile,
        'province': cleanObj?.province,
        'district': cleanObj?.district,
        'zone': cleanObj?.zone,
        'note': cleanObj?.note,
        'corregimiento': cleanObj?.corregimiento,
      },
      {
        where: {
          id: id
        }
      }
    )
  }
}

const setFavoriteAddressByUser = async(id, userId) => {
  const getAddress = await UserAddress.findOne({
    where: {
      id: id,
      userId: userId
    }
  })

  if (getAddress) {
    if (getAddress.selected) {
      return await UserAddress.update({
        selected: null
      },{
        where: {
          id: id
        }
      })
    } else {
      return await UserAddress.update({
        selected: true
      },{
        where: {
          id: id
        }
      })
    }
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
    checkValidUser,
    setFavoriteAddressByUser
}
