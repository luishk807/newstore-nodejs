const Category = require('../pg/models/Categories');

const getAllCategories = () => {
    return Category.findAll({});
}

const createCategoryObject = (name, statusId) => {
    return { name, statusId }
}

const saveCategories = (arrayOfCategories) => {
    const categories = [];
    if (!!arrayOfCategories.length) {
        arrayOfCategories.forEach(c => {
            categories.push(createCategoryObject(c, 1));
        });
    }
    if (categories.length > 0) {
        return Category.bulkCreate(categories);
    }
    return Promise.resolve([])
}


module.exports = {
    saveCategories,
    getAllCategories
}
