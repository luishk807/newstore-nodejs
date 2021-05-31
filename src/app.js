const express = require('express');
const bodyParser = require('body-parser');
const configOAuth = require('./oauth');
const sslRedirect = require('heroku-ssl-redirect').default;
// const cors = require('cors');
const routesLoader = require('./routes-loader');
const app = express();

app.use(bodyParser.urlencoded({ extended: true } ));
app.use(bodyParser.json({ limit: '5mb' }));

// enable ssl redirect
app.use(sslRedirect());

// Still need to configure app.oauth.authorize() middleware in routes, seems like tricket to make this app.oauth.authoerize() available in routes
// configOAuth(app);
app.use(sslRedirect(['production'], 301));

// set up a route to redirect http to https
if (process.env.NODE_ENV === "production") {
  app.get('*', (request, response) => {
    response.redirect('https://' + request.headers.host + request.url);
  });
}

routesLoader(app, './routes');
// app.use(cors());
// app.options('*', cors());

module.exports = app
