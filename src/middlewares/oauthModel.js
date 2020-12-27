/**
 * OAuthServer model, used by express-oauth-server wrapper
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const service = require('../services/inventarioz/account.service');

const getAccessToken = async function(bearerToken) {
    const token = prisma.oauth_tokens.findUnique({
        where: {
          access_token: bearerToken
        }
    });
    return {
        accessToken: token.access_token,
        client: { id: token.client_id },
        expires: token.access_token_expires_on,
        user: { id: token.user_account_id }
    }
};
  
const getClient = async function *(clientId, clientSecret) {
    const client = await prisma.oauth_clients.findUnique({
        where: {
            client_id: clientId,
            client_secret: clientSecret
        }
    });
    if (!client) {
        return;
    }
    return {
        clientId: oAuthClient.client_id,
        clientSecret: oAuthClient.client_secret,
        grants: ['password'], // OAuth2 grant types
    }
};
  
const getRefreshToken = async function *(bearerToken) {
    const result = prisma.oauth_tokens.findUnique({
        where: {
            refresh_token: bearerToken
        }
    });
    if (result) {
        return true;
    }
    return false;
};
  
const getUser = function *(username, password) {
    return service.authenticate(username, password);
};
  
const saveAccessToken = async function *(token, client, user) {
    const result = await prisma.oauth_tokens.create({
        access_token: token.accessToken,
        access_token_expires_on: token.accessTokenExpiresOn,
        client_id: client.id,
        refresh_token: token.refreshToken,
        user_account_id: user.id
    });
    logger.debug(['Saved access token result', result]);
    if (result) {
        return true;
    }
    return false;
};

module.exports = {
    getAccessToken,
    getClient,
    getRefreshToken,
    getUser,
    saveAccessToken
}
