const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductRate = require('./ProductRates');

const ProductImages = require('./ProductImages');

const UserWishlist = require('./UserWishlists');

// const ProductQuestionModel = require('./ProductQuestions');
// const ProductQuestion = ProductQuestionModel.getModel();

const Statuses = require('./Statuses');

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
},
{
  schema: 'public',
}
);

Product.hasMany(ProductRate, { as: "rates" });

ProductRate.belongsTo(Product, { foreignKey: "productId", as: "rateProduct"})

UserWishlist.belongsTo(Product, {foreignKey: 'productId', as: 'wishlistProduct'});

// Product.hasMany(ProductQuestion, { as: "product_questions" });
Product.hasMany(ProductImages, { as: "productImages"});

//Product.hasMany(UserWishlist, { foreignKey: 'productId', as: 'productWishlist'})
ProductImages.belongsTo(Product, { foreignKey: 'productId', as: 'ProductImageProduct'});

Product.belongsTo(Statuses, { foreignKey: 'statusId', as: 'productStatus'});


module.exports = Product;