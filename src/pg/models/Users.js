const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductAnswerModel = require('./ProductAnswers');
const ProductAnswer = ProductAnswerModel.getModel();

const ProductQuestionModel = require('./ProductQuestions');
const ProductQuestion = ProductQuestionModel.getModel();

const User = sequelize.define('users', {
  first_name: {
    type: Sequelize.TEXT
  },
  last_name: {
    type: Sequelize.TEXT
  },
  password: {
    type: Sequelize.TEXT
  },
  email: {
    type: Sequelize.TEXT
  },
  mobile: {
    type: Sequelize.TEXT
  },
  userRole: {
    type: Sequelize.BIGINT,
    field: 'userRoleId',
  },
  phone: {
    type: Sequelize.TEXT
  },
  img: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId',
  },
  gender: {
    type: Sequelize.BIGINT,
    field: 'genderId',
  },
  date_of_birth: {
    type: Sequelize.DATE
  },
});

//User.hasMany(ProductAnswer, { as: "product_answers" });

User.hasMany(ProductQuestion, { as: "product_questions" });

ProductAnswer.belongsTo(User, {
  foreignKey: "userId",
  as: "users",
  onDelete: 'CASCADE',
});

ProductQuestion.belongsTo(User, {
  foreignKey: "userId",
  as: "users",
  onDelete: 'CASCADE',
});

User.belongsToMany(ProductAnswer, { through: "UserAnswer" });
ProductAnswer.belongsToMany(User, { through: "UserAnswer" });

const getUser = () => {
  return User;
}

module.exports.getModel = getUser;