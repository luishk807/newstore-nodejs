const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductQuestion = sequelize.define('product_questions', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  question: {
    type: Sequelize.NUMBER
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

const getProductQuestions = () => {
  return ProductQuestion;
}

module.exports.getModel = getProductQuestions;