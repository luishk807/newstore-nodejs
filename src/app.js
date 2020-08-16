const express = require('express');
const app = express();

app.use('/api', require('./products/router'));

module.exports = app
