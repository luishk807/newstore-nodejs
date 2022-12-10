const Color = require('../pg/models/Colors');
const { TRASHED_STATUS } = require('../constants');
const includes = ['colorStatus'];
const config = require('../config');
const { paginate } = require('../utils');
const { Op } = require('sequelize');
const LIMIT = config.defaultLimit;

const createColor = async (value) => {
    if (value) {
        const checkColor = await Color.findOne({where: { 
            [Op.or]: [
                {color: value.color},
                {name: value.name}
            ],
            status: {
                [Op.ne]: TRASHED_STATUS
            }
        }})
        if (!checkColor) {
            const dataEntry = {
                'color': value.color,
                'name': value.name
            }
            return await Color.create(dataEntry);
        } else {
            return {status: false, message: 'color or name already exists'};
        }
    }
    return null;
}

const deleteColorById = async(id) => {
    if (id) {
          // delete color
        const foundColor = await Color.findOne({ where: {id: id}})
        if (foundColor) {
            const del = await Color.destroy({ where: {id: id }});
            if (del) {
                return {status: false, code: 200, message: 'color deleted'};
            } else {
                return {status: false, code: 400, message: 'ERROR: unable to delete color'};
            }
        } else {
            return {status: false, code: 500, message: 'color not found'};
        }
    }
    return null;
}

const trashedColorById = async(id) => {
    if (id) {
          // delete color
        const foundColor = await Color.findOne({ where: {id: id}})
        if (foundColor) {
            const del = await Color.update({
                statusId: TRASHED_STATUS
            },{ where: {id: id }});
            if (del) {
                return {status: false, code: 200, message: 'color removed'};
            } else {
                return {status: false, code: 400, message: 'ERROR: unable to remove color'};
            }
        } else {
            return {status: false, message: 'color not found'};
        }
    }
    return null;
}

const updateColor = async(req) => {
    let dataInsert = null;
    const body = req.body;
    const bid = req.params.id;
  
    dataInsert = {
      'color': body.color,
      'name': body.name,
      'status': body.status,
    }

    return await Color.update({
        dataInsert
    },{ where: {id: bid }});
}


const getColorById = (id) => {
    if (id) {
        return Color.findOne({ where: { id: id }, include: includes});
    }
    return null;
}

const getColorByProductId = async(prod) => {
    return await Color.findAll({ where: {productId: prod}, include: includes});
}

const getActiveColorByProductId = async(prod) => {
    return await Color.findAll({ where: {
        productId: prod,
        status: 1
    }, include: includes});
}

const getColorByIds = async(ids) => {
    return await Color.findAll({ where: { id: { [Op.in]: ids}}, include: includes});
}

const getAllColor = async(ids) => {
    return await Color.findAll({include: includes});
}

const getAllActiveColor = async(ids) => {
    return await Color.findAll({include: includes, where: {
        status: 1
    }});
}

const getAllActiveColorsWithFilters = async(user, filter) => {
    // pagination doesn't work with hasMany association, in this case remove userAddress
    let query = {}
    if (user) {
      query = {
        where: {
          status: {
            [Op.ne]: TRASHED_STATUS
          },
          id: { 
            [Op.ne]: user.id 
          } // This does not work
        },
        include: includes,
      };
    } else {
      query = {
        include: includes
      };
    }

    const page = filter.page;

    const limit = filter.limit ? filter.limit : LIMIT;

    const sortBy = filter.sortBy ? filter.sortBy : null;

    query['order'] = [
      ['createdAt', 'DESC'],
      ['updatedAt', 'DESC'],
    ]
    // query['attributes'] = [
    //   'first_name',
    //   'id',
    //   'last_name',
    //   'email',
    //   'createdAt',
    //   'status'
    // ]

    if (sortBy) {
        switch(sortBy) {
            case 'date_new': {
                orderBy = [
                    ['createdAt', 'DESC'],
                ]
                break;
            }
            case 'date_old': {
                orderBy = [
                    ['createdAt', 'ASC'],
                ]
                break;
            }
        }
    } else {
        orderBy = [
            ['updatedAt', 'DESC'],
            ['createdAt', 'DESC'],
        ]
    }

    if (page) {
        query = {
            ...query,
            distinct: true,
            order: orderBy,
            limit: limit,
            offset: paginate(page, limit),
        }
        return await Color.findAndCountAll(query);
    } else {
        query = {
            ...query,
            order: orderBy,
        }
        return await Color.findAll(query);
    }
}

module.exports = {
    deleteColorById,
    trashedColorById,
    createColor,
    updateColor,
    getColorById,
    getColorByProductId,
    getColorByIds,
    getAllColor,
    getAllActiveColor,
    getAllActiveColorsWithFilters,
    getActiveColorByProductId
}
