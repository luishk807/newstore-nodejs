const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Employee = sequelize.define('employee', {
  name: {
    type: Sequelize.TEXT
  },
  rollnumber: {
    type: Sequelize.INTEGER
  }
});

const getEmployee = () => {
  return Employee;
}

module.exports.getEmployeeModel = getEmployee;