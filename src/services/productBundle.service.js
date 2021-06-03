const ProductBundle = require('../pg/models/ProductBundles');
const includes = ['productBundleStatus', 'productBundleProductItem'];
const orderBy = [['updatedAt', 'DESC'], ['createdAt', 'DESC']]
const { Op } = require('sequelize');

const createProductBundle = async (value) => {
  if (value) {
    const dataEntry = {
      'productItem': value.productItemId,
      'quantity': value.quantity,
      'retailPrice': value.retailPrice,
      'name': value.name
    }

    const result = await ProductBundle.create(dataEntry);
    return result;
  }
  return null;
}

const deleteProductBundleById = async(id) => {
  const bundles = await ProductBundle.findAll({ where: {id: id}})

  if (bundles) {
    return await ProductBundle.destroy({
      where: {
        id: id
      }
    })
  } else {
    return { code: 500, status: false, message: "Invalid product bundle" }
  }
}

const saveProductBundle = async (value) => {
  const body = value.body;
  const id = value.params.id;

  return ProductBundle.update({
      'name': body.name,
      'productItem': body.productItemId,
      'status': body.status,
      'quantity': body.quantity,
      'retailPrice': body.retailPrice
  },
  {
      where: {
          id: id
      }
  });
}

const geAllProductBundles = async (page = null) => {
  let query = {
      include: includes
  }
  
  if (page) {
      query = {
          ...query,
          limit: LIMIT,
          distinct: true,
          offset: paginate(page),
      }
  }

  const product = await ProductBundle.findAndCountAll(query);
  return product;
}

const getProductBundleById = async(id) => {
  if (id) {
    return ProductBundle.findOne({ where: { id: id }, include: includes});
  } else {
    return { code: 500, status: false, message: "Invalid bundle" }
  }
}

const getProductBundleByIds = async(ids, page = null) => {
  const where = {
      id: {
          [Op.in]: ids
      }
  }

  if (page) {
      const offset = paginate(page);

      const countResult = await ProductBundle.count({ where });

      const result = await ProductBundle.findAll({
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
      const product = await ProductBundle.findAll({ where, include: includes, orderBy: orderBy});
      return product;
  }

}

const getProductBundleByProductItemId = async (id) => {
  const bundle = await ProductBundle.findAll({ where: { productItemId: +id }, order: [['quantity', 'ASC']] });
  return bundle;
}

const getActiveProductBundleByProductItemId = async (id) => {
  const bundle = await ProductBundle.findAll({ where: { productItemId: +id, statusId: 1 }, order: [['quantity', 'ASC']] });
  return bundle;
}

module.exports = {
    createProductBundle,
    deleteProductBundleById,
    saveProductBundle,
    getProductBundleByProductItemId,
    getActiveProductBundleByProductItemId,
    getProductBundleById,
    getProductBundleByIds,
    geAllProductBundles
}