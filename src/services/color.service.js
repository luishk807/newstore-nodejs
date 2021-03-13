const Color = require('../pg/models/Colors');
const includes = ['colorStatus'];
const { Op } = require('sequelize');

const createColor = async (value) => {
    if (value) {
        const checkColor = await Color.findOne({where: { 
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
            const result = await Color.create(dataEntry);
            return result;
        } else {
            return {status: false, message: 'color or name already exists'};
        }
    }
    return null;
}

const getColorById = (id) => {
    if (id) {
        return Color.findOne({ where: { id: id }, include: includes});
    }
    return null;
}

module.exports = {
    createColor,
    getColorById
}
