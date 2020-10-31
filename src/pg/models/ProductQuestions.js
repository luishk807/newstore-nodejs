const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductAnswer = require('./ProductAnswers');

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

ProductQuestion.hasMany(ProductAnswer, { foreignKey: 'productQuestionId', as: 'questionAnswers'});


// ProductAnswer.belongsTo(ProductQuestion, { foreignKey: 'question', as: 'answerQuestion'});

module.exports = ProductQuestion;