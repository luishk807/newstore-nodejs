const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductRateModel = require('./ProductRates');
const ProductRate = ProductRateModel.getModel();

const ProductImagesModel = require('./ProductImages');
const ProductImages = ProductImagesModel.getModel();

// const ProductQuestionModel = require('./ProductQuestions');
// const ProductQuestion = ProductQuestionModel.getModel();

const StatusModel = require('./Statuses');
const Statuses = StatusModel.getModel();

const Product = sequelize.define('product', {
  name: { type: Sequelize.TEXT },
  amount: { type: Sequelize.DECIMAL },
  category: { type: Sequelize.BIGINT, field: 'categoryId' },
  brand: { type: Sequelize.BIGINT, field: 'brandId' },
  vendor: { type: Sequelize.BIGINT, field: 'vendorId' },
  status: { type: Sequelize.BIGINT, field: 'statusId' },
  image: { type: Sequelize.TEXT },
  stock: { type: Sequelize.INTEGER },
  description: { type: Sequelize.TEXT },
  model: { type: Sequelize.TEXT },
  code: { type: Sequelize.TEXT },
});

Product.hasMany(ProductRate, { as: "rates" });
// Product.hasMany(ProductQuestion, { as: "product_questions" });
Product.hasMany(ProductImages);

//Statuses.hasMany(Product, { as: 'productStatus', foreignKey: 'product'})
// Product.belongsToMany(ProductImages, { through: "product_img" });
// ProductImages.belongsToMany(Product, { through: "product_img" });

ProductImages.belongsTo(Product);

Product.belongsTo(Statuses, { foreignKey: 'statusId', as: 'productStatus'});

const getProduct = () => {
  return Product;
}

module.exports.getModel = getProduct;