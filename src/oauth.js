const OAuthServer = require('express-oauth-server');

const configOAuth = (app) => {

    // app.oauth = new OAuthServer({
    //     debug: true,
    //     model: require('./middlewares/oauthModel')
    // });

    // // This line forces all rouets to require oauth
    // // app.use(app.oauth.authorize());

    // // Post token.
    // app.post('/oauth/token', app.oauth.token());

    // // Get authorization.
    // app.get('/oauth/authorize', function(req, res) {
    //     // Redirect anonymous users to login page.
    //     if (!req.app.locals.user) {
    //         return res.redirect(util.format('/login?redirect=%s&client_id=%s&redirect_uri=%s', req.path, req.query.client_id, req.query.redirect_uri));
    //     }
    
    //     return render('authorize', {
    //         client_id: req.query.client_id,
    //         redirect_uri: req.query.redirect_uri
    //     });
    // });
    
    // // Post authorization.
    // app.post('/oauth/authorize', function(req, res) {
    //     // Redirect anonymous users to login page.
    //     if (!req.app.locals.user) {
    //         return res.redirect(util.format('/login?client_id=%s&redirect_uri=%s', req.query.client_id, req.query.redirect_uri));
    //     }
    
    //     return app.oauth.authorize();
    // });
}



module.exports = configOAuth;
