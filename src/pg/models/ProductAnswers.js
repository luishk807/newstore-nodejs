const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductAnswer = sequelize.define('product_answers', {
  question: {
    type: Sequelize.BIGINT,
    field: 'questionId'
  },
  answer: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

const getProductAnswers = () => {
  return ProductAnswer;
}

module.exports.getModel = getProductAnswers;