const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductRate = require('./ProductRates');

const ProductSize = require('./ProductSizes');

const ProductColor = require('./ProductColors');

const ProductImages = require('./ProductImages');

const UserWishlist = require('./UserWishlists');

const Brand = require('./Brands');

const ProductItem = require('./ProductItems');

const ProductDiscount = require('./ProductDiscounts');

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
  sku: { type: Sequelize.TEXT },
},
{
  schema: 'public',
}
);

Product.hasMany(ProductRate, { as: "rates" });

ProductRate.belongsTo(Product, { foreignKey: "productId", as: "rateProduct"})

UserWishlist.belongsTo(Product, {foreignKey: 'productId', as: 'wishlistProduct'});

Product.belongsTo(Brand, { foreignKey: 'brand', as: 'productBrand'});

Brand.hasMany(Product, { foreignKey: 'brand', as: 'brandProduct'} )
// Product.hasMany(ProductQuestion, { as: "product_questions" });

Product.hasMany(ProductImages, { as: "productImages"});

Product.hasMany(ProductSize, { as: "productSizes"});

Product.hasMany(ProductDiscount, { as: "productProductDiscount"});

ProductDiscount.belongsTo(Product, { foreignKey: 'productId', as: 'productDiscountProduct'});

Product.hasMany(ProductColor, { as: "productColors"});

Product.hasMany(ProductItem, { as: "productProductItems"})

ProductItem.belongsTo(Product, { foreignKey: 'productId', as: 'productItemProduct'} )

//Product.hasMany(UserWishlist, { foreignKey: 'productId', as: 'productWishlist'})

Product.belongsTo(Statuses, { foreignKey: 'statusId', as: 'productStatus'});


module.exports = Product;