const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductAnswerModel = require('./ProductAnswers');
const ProductAnswer = ProductAnswerModel.getModel();

const ProductQuestion = sequelize.define('product_questions', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  question: {
    type: Sequelize.NUMBER
  },
  userId: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

ProductQuestion.hasMany(ProductAnswer, { as: "product_answers" });

const getProductQuestions = () => {
  return ProductQuestion;
}

module.exports.getModel = getProductQuestions;