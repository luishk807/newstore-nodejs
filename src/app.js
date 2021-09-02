const express = require('express');
const bodyParser = require('body-parser');
const configureHooks = require('./hooks');

// const cors = require('cors');
const routesLoader = require('./routes-loader');
const app = express();

app.use(bodyParser.urlencoded({ extended: true } ));
app.use(bodyParser.json({ limit: '5mb' }));

routesLoader(app, './routes', ['api']);
// app.use(cors());
// app.options('*', cors());

configureHooks();

module.exports = app
