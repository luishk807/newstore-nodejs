const Brand = require('../pg/models/Brands');

const getAllBrands = () => {
    return Brand.findAll({});
}

const createBrandObject = (name, statusId) => {
    return { name, statusId }
}

const saveBrands = (arrayOfBrands) => {
    const brands = [];
    if (!!arrayOfBrands.length) {
        arrayOfBrands.forEach(b => {
            brands.push(createBrandObject(b, 1));
        });
    }
    if (brands.length > 0) {
        return Brand.bulkCreate(brands);
    }
    return Promise.resolve([])
}

module.exports = {
    getAllBrands,
    saveBrands
}
