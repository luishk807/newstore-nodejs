const express = require('express');
const bodyParser = require('body-parser');
const configOAuth = require('./oauth');
const redirectSSL = require('redirect-ssl');
// const cors = require('cors');
const routesLoader = require('./routes-loader');
const app = express();

app.use(bodyParser.urlencoded({ extended: true } ));
app.use(bodyParser.json({ limit: '5mb' }));

// Add middleware
app.use(redirectSSL.create({
  exclude: ['localhost'],
  enabled: process.env.NODE_ENV === 'production'
}));

// Still need to configure app.oauth.authorize() middleware in routes, seems like tricket to make this app.oauth.authoerize() available in routes
// configOAuth(app);

routesLoader(app, './routes');
// app.use(cors());
// app.options('*', cors());

module.exports = app
