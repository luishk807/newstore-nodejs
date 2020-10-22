const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const UserModel = require('./Users');
const User = UserModel.getModel();

const ProductAnswer = sequelize.define('product_answers', {
  question: {
    type: Sequelize.BIGINT,
    field: 'productQuestionId'
  },
  answer: {
    type: Sequelize.TEXT
  },
  userId: {
    type: Sequelize.BIGINT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

ProductAnswer.belongsTo(User, {
  foreignKey: "userId",
  as: "users",
  onDelete: 'CASCADE',
});

const getProductAnswers = () => {
  return ProductAnswer;
}

module.exports.getModel = getProductAnswers;