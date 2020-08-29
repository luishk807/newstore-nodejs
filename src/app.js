const express = require('express');
const app = express();

app.use('/api', require('./products/router'));
app.use('/api', require('./brands/router'));

module.exports = app
