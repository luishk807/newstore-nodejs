const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductAnswer = sequelize.define('product_answers', {
  question: {
    type: Sequelize.BIGINT,
    field: 'productQuestionId'
  },
  answer: {
    type: Sequelize.TEXT
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

module.exports = ProductAnswer;