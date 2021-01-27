const router = require('express').Router();
const cors = require('cors');
router.all('*', cors());

const oauth = require('../../../middlewares/oauth');

// This line forces all rouets to require oauth
// app.use(app.oauth.authorize());

// Post token.
router.post('/token', oauth.token());

// Get authorization.
router.get('/authorize', function(req, res) {
    // Redirect anonymous users to login page.
    if (!req.app.locals.user) {
        logger.debug(req.path);
        return res.redirect(`/login?client_id=${req.query.client_id}&redirect_uri=${req.query.redirect_uri}`);
    }

    return render('authorize', {
        client_id: req.query.client_id,
        redirect_uri: req.query.redirect_uri
    });
});

// Post authorization.
router.post('/authorize', function(req, res) {
    // Redirect anonymous users to login page.
    if (!req.app.locals.user) {
        return res.redirect(`/login?client_id=${req.query.client_id}&redirect_uri=${req.query.redirect_uri}`);
    }

    return oauth.authorize();
});



module.exports = router;
