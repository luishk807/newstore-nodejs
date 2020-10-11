const express = require('express');
const cors = require('cors');
const app = express();
// app.use(cors());
// app.options('*', cors());
app.use('/api', require('./routes/products'));
app.use('/api', require('./routes/categories'));
app.use('/api', require('./routes/vendors'));
app.use('/api', require('./routes/brands'));
app.use('/api', require('./routes/workRoles'));
app.use('/api', require('./routes/statuses'));
app.use('/api', require('./routes/stores'));
app.use('/api', require('./routes/userAddresses'));
app.use('/api', require('./routes/countries'));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/genders'));
app.use('/api', require('./routes/userRoles'));

module.exports = app
