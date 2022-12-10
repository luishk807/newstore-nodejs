const Category = require('../pg/models/Categories');
const includes = ['categoryStatus'];
const { TRASHED_STATUS } = require('../constants');
const { returnSlugName } = require('../utils');

const deleteCategoryById = async(id) => {
    const item = await Category.findOne({ where: {id: id}})
    if (item) {
        return await Category.destroy({
            where: {
                id: id
            }
        })
    } else {
        return {code: 500, status: false, message: 'Invalid category'};
    }
}

const softDeleteCategoryById = async(id) => {
    const category = await Category.findOne({ where: {id: id}})
    if (category) {
        const deleteCategory = await Category.update({
            'status': TRASHED_STATUS,
        },
        {
            where: {
                id: id
            }
        });
        if (deleteCategory) {
            return {
              code: 200, 
              status: true,
              message: "Category deleted"
            }
          } else {
            return {
              code: 400, 
              status: false,
              message: "ERROR: Unable to delete category"
            }
          }
    } else {
      return { code: 500, status: false, message: "Invalid category" }
    }
}

const createCategoryObject = (name, statusId) => {
    return { name, statusId }
}

const createCategory = async(value) => {
    const slugName = returnSlugName(value.name);
    if (value) {
        const dataEntry = {
            'name': value.name,
            'icon': value.icon,
            'altUrl': value.altUrl,
            'key': slugName
        }
    
        return await Category.create(dataEntry);
      }
      return null;
}


const saveCategory = async(value) => {
    const body = value.body;
    const id = value.params.id;

    return Category.update({
        'name': body.name,
        'status': body.status,
        'altUrl': body.altUrl,
        'icon': body.icon,
    },
    {
        where: {
            id: id
        }
    });
}

const setPriority = async(id) => {
    const category = await Category.findOne({ where: {id: id}});
    if (category) {
        const result = await Category.update({
            'priority': false
        },
        {
            where: {
                'priority': true
            }
        });
        return Category.update({
            'priority': true
        },
        {
            where: {
                id: id
            }
        });
    } else {
        return { code: 500, status: false, message: "Invalid category" }
    }
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

const getAllCategories = async() => {
    let orderBy = [
        ['priority', 'DESC']
    ]

    return Category.findAll({ where:{status: 1}, order: orderBy, include: includes});
}

const getCategoryById = async(id) => {
    if (id) {
        return Category.findOne({ where: { id: id }, include: includes});
    } else {
        return { code: 500, status: false, message: "Invalid category" }
    }
}

module.exports = {
    saveCategories,
    saveCategory,
    getAllCategories,
    getCategoryById,
    createCategory,
    deleteCategoryById,
    softDeleteCategoryById,
    setPriority
}
