const OAuthServer = require('express-oauth-server');

const oauth = new OAuthServer({
    debug: true,
    model: require('./oauthModel')
});

module.exports = oauth;
