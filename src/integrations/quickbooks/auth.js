// https://github.com/intuit/oauth-jsclient
const OAuthClient = require('intuit-oauth');
const moment = require('moment');
const { getDateAsUTCDate } = require('../../utils/dates');
const config = require('../../config');

const log = global.logger || { info: () => {}, debug: () => {}, error: () => {} };

function isSandbox() {
    return (config.integrations.quickbooks.environment === 'sandbox') ? true : false
}

const oauthClient = new OAuthClient({
  clientId: config.integrations.quickbooks.clientId,
  clientSecret: config.integrations.quickbooks.clientSecret,
  environment: config.integrations.quickbooks.environment, // 'sandbox' || 'production',
  redirectUri: config.integrations.quickbooks.redirectUri,
  logging: isSandbox()
});

// AuthorizationUri
const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
    state: 'testState'
});

/** Parses the redirect url returned after authentication */
function parseRedirect(redirectUrl) {
    return oauthClient.createToken(redirectUrl)
        .then(function (authResponse) {
            // console.log(JSON.stringify(authResponse));
            return authResponse;
            // access_token, refresh_token, x_refresh_token_expires_in, expires_in, token_type
        })
        .catch(function (error) {
            log.error('Error parsing redirect url from Quickbooks', error);
        })
}

/** Refreshes the token with the access values given */
function refreshToken(access, realmId) {
    // Got to database to get stored token and refresh the token
    oauthClient.setToken({ ...access, realmId });
    return oauthClient.refresh()
        .then(function (authResponse) {
            return authResponse;
        })
        .catch(function (error) {
            log.error('Error refreshing token from Quickbooks', error);
            throw error;
        })
}

/**
 * Revokes the token and disconnects from Quickbooks 
 * @param access Access object, requires the refresh_token in it in order to be able to revoke
 */
function revokeToken(access, realmId) {
    oauthClient.setToken({ ...access, realmId });
    return oauthClient.revoke({ refresh_token: access.refresh_token, access_token: access.access_token })
        .then(function (authResponse) {
            log.info(`Tokens revoked ${JSON.stringify(authResponse.json)}`);
            console.log(`Tokens revoked ${JSON.stringify(authResponse.json)}`);
            return authResponse;
        })
        .catch(function (error) {
            log.error('Error revoking/disconnecting from Quickbooks', error);
            console.error('Error revoking/disconnecting from Quickbooks', error);
            return false;
        })
}

/**
 * Checks quickbooks access object and the last update to see if it the token has already expired
 * @param {*} accessObject object that contains quickbooks access token values
 * @param {Date} lastUpdate Date in UTC when the access token was last updated
 */
function isAccessTokenExpired(accessObject, lastUpdate) {
    if (accessObject) {
        const lastDateUpdated = moment(getDateAsUTCDate(lastUpdate));
        const date = lastDateUpdated.add(accessObject.expires_in, 'seconds');
        // If current date is less than the expired date
        if (moment().utc() < date) {
            return false;
        }
    }
    return true;
}

/**
 * Checks if the refresh token is expired, 100 days
 * @param {*} accessObject object that contains quickbooks access token values
 * @param {Date} lastUpdate Date in UTC when the access token was last updated
 */
function isRefreshTokenExpired(accessObject, lastUpdate) {
    if (accessObject) {
        const lastDateUpdated = moment(getDateAsUTCDate(lastUpdate));
        const date = lastDateUpdated.add(accessObject.x_refresh_token_expires_in, 'seconds').add(-1, 'days'); // Deducting 1 day because somehow it calculates to 101 days
        // If current date is less than the expired date
        // This utc thing does not work
        if (moment().utc() < date) {
            return { expired: false, expires: date };
        } else {
            return { expired: true, expires: date };
        }
    }
    return { expired: true };
}

module.exports = {
    authorizeUri: authUri,
    parseRedirect,
    refreshToken,
    revokeToken,
    isAccessTokenExpired,
    isRefreshTokenExpired
}
