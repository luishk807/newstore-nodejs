const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

// const cors = require('cors');
const routesLoader = require('./routes-loader');
const app = express();
app.use(bodyParser.urlencoded({ extended: true } ));
app.use(bodyParser.json());

routesLoader(app, './routes');
// app.use(cors());
// app.options('*', cors());

module.exports = app
