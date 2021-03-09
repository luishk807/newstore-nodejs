const ProductBundle = require('../pg/models/ProductBundles');
const includes = ['productBundleStatus'];

const createProductBundle = async (value) => {
  if (value) {
    const dataEntry = {
      'productItem': body.productItem,
      'stock': body.stock,
      'retailPrice': body.retailPrice,
      'name': body.name
    }

    const result = await ProductBundle.create(dataEntry);
    return result;
  }
  return null;
}

const getProductBundleById = (id) => {
  if (id) {
    return ProductBundle.findOne({ where: { id: id }, include: includes});
  }
  return null;
}

module.exports = {
    createProductBundle,
    getProductBundleById
}
