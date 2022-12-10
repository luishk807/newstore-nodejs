const PromotionCode = require('../pg/models/PromotionCodes');
const { Op } = require('sequelize');
const { TRASHED_STATUS } = require('../constants');
const { paginate } = require('../utils');
const includes = ['promotionCodeStatus'];

const deletePromotionCode = async (id) => {
  const item = await PromotionCode.findOne({ where: {id: id}})
  if (item) {
      return await PromotionCode.destroy({
          where: {
              id: id
          }
      })
  } else {
      return {code: 500, status: false, message: 'Invalid promotion'};
  }
}

const softDeletePromotionCodeById = async (id) => {
  const item = await PromotionCode.findOne({ where: {id: id}})
  if (item) {
    const softDelete = await PromotionCode.update({
        'statusId': TRASHED_STATUS,
    },
    {
        where: {
            id: id
        }
    });
    if (softDelete) {
      return {
        code: 200, 
        status: true,
        message: "Promotion deleted"
      }
    } else {
      return {
        code: 400, 
        status: false,
        message: "ERROR: Unable to delete promotion"
      }
    }
  } else {
      return {code: 500, status: false, message: 'Invalid promotion'};
  }
}

const createPromotionCode = async (value) => {
    let startDate = null;
    let endDate = null;
    const nUseDate = value.useDate === 'true' ? true : false;

    if (nUseDate) {
        startDate = (value.startDate) ? value.startDate : null;
        endDate = (value.endDate) ? (value.endDate) : new Date(9999, 11, 31);
    } else {

    }

    return PromotionCode.create({
        'name': value.name,
        'useDate': nUseDate,
        'startDate': startDate,
        'endDate': endDate,
        'promoCode': value.promoCode,
        'percentage': +value.percentage,
    });
}

const updatePromotionCode = async (value) => {
    const body = value.body;
    const id = value.params.id;

    let startDate = null;
    let endDate = null;
    const nUseDate = body.useDate === 'true' ? true : false;

    if (nUseDate) {
        startDate = (body.startDate) ? body.startDate : null;
        endDate = (body.endDate) ? (body.endDate) : new Date(9999, 11, 31);
    }

    return PromotionCode.update({
        'name': body.name,
        'useDate': nUseDate,
        'startDate': startDate,
        'endDate': endDate,
        'promoCode': body.promoCode,
        'percentage': +body.percentage,
        'statusId': +body.status,
    },
    {
        where: {
            id: id
        }
    });
}

const getPromotionCodeById = async (id, isActive = false) => {
    let query = null;

    if (isActive) {
      query = {
        id: id,
        statusId: 1
      }
    } else {
      query = {
        id: id
      }
    }

    if (id) {
        const colors = await PromotionCode.findOne({ where: query, include: includes});
        return colors;
    }
    return null;
}

const getPromotionCodeByProductId = async (id, isActive = false) => {
    let query = null;

    if (isActive) {
      query = {
        productId: +id,
        statusId: 1
      }
    } else {
      query = {
        productId: +id
      }
    }

    if (id) {
        const colors = await PromotionCode.findAll({ where: query, include: includes });
        return colors;
    }
    return null;
}

const getPromotionCodeByIds = async (ids, page = null, isActive = false) => {
    const where = {
        id: {
            [Op.in]: ids
        }
    };

    if (isActive) {
      where = {
        ...where,
        statusId: 1
      }
    }

    if (page) {
        const offset = paginate(page);

        const countResult = await PromotionCode.count({ where });

        const result = await PromotionCode.findAll({
            where,
            include: includes,
            offset: offset,
            limit: LIMIT
        });

        const pages = Math.ceil(countResult / LIMIT)
        const results = {
            count: countResult,
            items: result,
            pages: pages
        }
        return results;
    } else {
        const product = await PromotionCode.findAll({ where, include: includes});
        return product;
    }
}

const getPromotionCodeByCode = async (code, isActive = false) => {
  let query = {
    promoCode: code,
  }

  if (isActive) {
    query = {
      ...query,
      statusId: 1
    }
  }

  return await PromotionCode.findOne({
    where: query
  });
}

const getPromotionCodes = async (page = null, isActive = false) => {
    let query = {
        include: includes
    }

    if (isActive) {
      query = {
        ...query,
        where: {
          statusId: 1
        }
      }
    }

    if (page) {
        query = {
            ...query,
            limit: LIMIT,
            distinct: true,
            offset: paginate(page),
        }
    }

    const product = await PromotionCode.findAndCountAll(query);
    return product;
}

module.exports = {
    createPromotionCode,
    updatePromotionCode,
    getPromotionCodeById,
    getPromotionCodeByProductId,
    getPromotionCodeByIds,
    getPromotionCodes,
    getPromotionCodeByCode,
    deletePromotionCode,
    softDeletePromotionCodeById
}
