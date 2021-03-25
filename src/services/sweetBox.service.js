const SweetBox = require('../pg/models/SweetBoxes');

const includes = [
  'sweetBoxSweetboxProduct', 
  'sweetboxesStatus', 
  'sweetBoxTypeSweetBox'
];
const { Op } = require('sequelize');

const createColor = async (value) => {
    if (value) {
        const checkColor = await SweetBox.findOne({where: { 
            [Op.or]: [
                {color: value.color},
                {name: value.name}
            ]
        }})
        if (!checkColor) {
            const dataEntry = {
                'color': value.color,
                'name': value.name
            }
            const result = await SweetBox.create(dataEntry);
            return result;
        } else {
            return {status: false, message: 'Sweetbox or name already exists'};
        }
    }
    return null;
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

module.exports = {
    createColor,
    searchSweetBoxById,
    searchActiveSweetBoxById
}