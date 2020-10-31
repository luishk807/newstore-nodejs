const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const ProductAnswer = require('./ProductAnswers');

const ProductQuestion = require('./ProductQuestions');

const UserWishlist = require('./UserWishlists');

const UserRole = require('./UserRoles');

const Rates = require('./ProductRates');

const Status = require('./Statuses');

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

User.hasMany(ProductAnswer, {  foreignKey: 'userId', as: "userAnswers" });

User.belongsTo(Status, { foreignKey: 'status', as: "useStatus"})
// User.hasMany(ProductQuestion, { foreignKey: 'userId', as: 'userQuestions'});

ProductQuestion.belongsTo(User, { foreignKey: 'id', as: 'questionUser'});

User.belongsTo(UserRole, { foreignKey: 'userRole', as: 'userRoles'})
User.hasMany(UserWishlist, { as: 'userWishlist'})

User.hasMany(Rates, {foreignKey: 'userId', as: "userRates"});

Rates.belongsTo(User, { foreignKey: 'userId', as: 'rateUsers'});

// Status.hasMany(User, { foreignKey: 'user', as: 'StatusUser'});

// ProductAnswer.hasOne(User, { foreignKey: 'user', as: 'answerUser'});

// ProductQuestion.belongsTo(User, { foreignKey: '', as: 'productQuestion'});

module.exports = User;