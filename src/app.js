const express = require('express');
const cors = require('cors');
const app = express();
// app.use(cors());
// app.options('*', cors());
app.use('/api', require('./routes/products'));
app.use('/api', require('./routes/categories'));
app.use('/api', require('./routes/vendors'));
app.use('/api', require('./routes/brands'));

module.exports = app
