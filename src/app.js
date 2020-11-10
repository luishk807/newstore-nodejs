const express = require('express');
const cors = require('cors');
const app = express();
// app.use(cors());
// app.options('*', cors());
app.use('/', require('./routes/products'));
app.use('/', require('./routes/categories'));
app.use('/', require('./routes/vendors'));
app.use('/', require('./routes/brands'));
app.use('/', require('./routes/workRoles'));
app.use('/', require('./routes/statuses'));
app.use('/', require('./routes/userAddresses'));
app.use('/', require('./routes/countries'));
app.use('/', require('./routes/users'));
app.use('/', require('./routes/genders'));
app.use('/', require('./routes/userRoles'));
app.use('/', require('./routes/login'));
app.use('/', require('./routes/adminlogin'));
app.use('/', require('./routes/productAnswers'));
app.use('/', require('./routes/productQuestions'));
app.use('/', require('./routes/productRates'));
app.use('/', require('./routes/userWishlists'));
app.use('/', require('./routes/vendorRates'));

module.exports = app
