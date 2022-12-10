const category = require('../services/category.service');

module.exports = {
    getAllCategories: category.getAllCategories,
    getCategoryById: category.getCategoryById,
    createCategory: category.createCategory,
    deleteCategoryById: category.deleteCategoryById,
    softDeleteCategoryById: category.softDeleteCategoryById,
    saveCategories: category.saveCategories,
    saveCategory: category.saveCategory,
    setPriority: category.setPriority
}
