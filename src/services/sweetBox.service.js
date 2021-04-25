const SweetBox = require('../pg/models/SweetBoxes');

const includes = [
  'sweetBoxSweetboxProduct', 
  'sweetboxesStatus', 
  'sweetBoxTypeSweetBox'
];
const { Op } = require('sequelize');

const createSweetBox = async (value) => {
    if (value) {
        const checkSweetBox = await SweetBox.findOne({where: { 
            [Op.or]: [
                {key: value.key},
                {name: value.name}
            ]
        }})

        if (checkSweetBox) {
            return {code: 500, status: false, message: 'Sweetbox or name already exists'};
        }
        
        return await SweetBox.create({
            'name': value.name,
            'sweetBoxType': value.sweetBoxType,
            'key': value.key
        });
    }
    return null;
}

const saveSweetBox = async (value, id) => {    
    return await SweetBox.update(
      {
        'name': value.name,
        'sweetBoxType': value.sweetBoxType,
        'status': value.status,
        'key': value.key
      },
      {
        where: {
          id: id
        }
      }
    );
}

const deleteSweetBox = async (id) => {
    const fsweetbox = await SweetBox.findOne({ where: {id: id}})
    if (fsweetbox) {
        return await SweetBox.destroy({
            where: {
                id: id
            }
        })
    } else {
        return {code: 500, status: false, message: 'Invalid sweetbox'};
    }
}

const searchSweetBoxById = async (id) => {
    const where = {
        id: id
    }

    const product = await SweetBox.findOne({ where, include: includes});
    return product;
}

const searchActiveSweetBoxById = async (id) => {
    const where = {
        id: id,
        statusId: 1
    }

    const product = await SweetBox.findOne({ where, include: includes});
    return product;
}

const getSweetBoxById = async (id) => {
    return await SweetBox.findOne({ where: { id: id }, include: includes});
}

const getActiveSweetBoxByType = async (type) => {
    return await SweetBox.findAll({ where: {sweetBoxTypeId: type, statusId: 1}, include: includes});
}

const getAllSweetBox = async () => {
    return await SweetBox.findAll({ include: includes});
}


const getAllActiveSweetBox = async () => {
    return await SweetBox.findAll({ where: {statusId: 1},include: includes});
}

module.exports = {
    createSweetBox,
    searchSweetBoxById,
    searchActiveSweetBoxById,
    deleteSweetBox,
    saveSweetBox,
    createSweetBox,
    getSweetBoxById,
    getActiveSweetBoxByType,
    getAllSweetBox,
    getAllActiveSweetBox
}