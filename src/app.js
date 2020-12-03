const express = require('express');
const cors = require('cors');
const routesLoader = require('./routes-loader');
const app = express();

routesLoader(app, './routes');
// app.use(cors());
// app.options('*', cors());

module.exports = app
