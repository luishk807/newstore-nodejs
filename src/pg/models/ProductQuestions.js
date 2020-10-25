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
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
  created: {
    type: Sequelize.DATE,
    field: 'createdAt'
  },
  updated: {
    type: Sequelize.DATE,
    field: 'updatedAt'
  }
});

ProductQuestion.hasMany(ProductAnswer, { as: "product_answers" });

const getProductQuestions = () => {
  return ProductQuestion;
}

module.exports.getModel = getProductQuestions;