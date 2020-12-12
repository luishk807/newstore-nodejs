
var config = module.exports;

const dotenv = require('dotenv');

dotenv.config();

config.express = {
  port: process.env.PORT || 5000,
  whitelist: ['http://localhost:3000','http://localhost:8080','https://avenidaz.herokuapp.com/', 'https://dev.avenidaz.com', 'https://avenidaz.com'],
}