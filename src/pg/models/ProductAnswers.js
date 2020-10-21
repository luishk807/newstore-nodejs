const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductQuestionModel = require('./ProductQuestions');
const ProductQuestion = ProductQuestionModel.getModel();

const ProductAnswer = sequelize.define('product_answers', {
  question: {
    type: Sequelize.BIGINT,
    field: 'questionId'
  },
  answer: {
    type: Sequelize.TEXT
  },
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

ProductAnswer.belongsTo(ProductQuestion, {
  foreignKey: "questionId",
  as: "questions",
  onDelete: 'CASCADE',
});

const getProductAnswers = () => {
  return ProductAnswer;
}

module.exports.getModel = getProductAnswers;