const Integration = require('../pg/models/integration/Integration');
const { STATUS } = require('../constants/integration');
const { isAccessTokenExpired, isRefreshTokenExpired, refreshToken, revokeToken } = require('../integrations/quickbooks/auth');
const { removeProperty } = require('../utils/object');
const INTEGRATIONS = Object.freeze({
    QUICKBOOKS: 'quickbooks'
});
// Gets the global logger or a skeleton (for unit test purposes)
const log = global.logger || { info: () => {}, debug: () => {}, error: () => {} };

/** Saves/updates the integration object to database */
const saveIntegration = async (integration) => {
    let sintegration = null;
    try {
        sintegration = await Integration.findOne({ where: { id: integration.id } });
    } catch (error) {
        log.error(error);
        console.log(error);
    }
    const insert = {
        ...integration.realmId && { realmId: integration.realmId },
        accessJson: JSON.stringify(integration.accessJson),
        accessUpdated: new Date()
    }
    const refreshTokenUpdated = isRefreshTokenUpdated(sintegration, integration);
    let result = null;
    if (sintegration) {
        result = await Integration.update({
            ...insert,
            ...refreshTokenUpdated && { refreshTokenUpdated: new Date() }
        }, { where: { id: integration.id }, returning: true, plain: true });
        if (Array.isArray(result) && (result.length > 1)) {
            return result[1]; // Index 0 is an indicator of the update, Index 1 is the returning data
        }
    } else {
        result = await Integration.create({
            id: integration.id,
            ...insert,
            refreshTokenUpdated: new Date()
        }, { returning: true, plain: true });
        if (Array.isArray(result) && result.length > 1) {
            return result[1]; // Index 0 is an indicator of the update, Index 1 is the returning data
        }
    }
    return result;
}

const deleteIntegration = async (id) => {
    if (!id) {
        throw Error('No id provided for integration delete');
    }
    try {
        const integration = await Integration.findOne({ where: { id: id }});
        await integration.destroy();
        return true;
    } catch (error) {
        log.error('Error deleting integration', error)
    }
    return false;
}

/** Gets the integration object from database based on id */
const getIntegration = async (id) => {
    return (await Integration.findOne({ where: { id: id }})).get({ plain: true });
}

/** Returns only id to check that it exists */
const integrationExists = async (id) => {
    return (await Integration.findOne({ attributes: ['id'], where: { id: id }})).get({ plain: true });
}

/** Indicates if the refresh token is different */
const isRefreshTokenUpdated = (currentIntegration, newIntegration) => {
    if (currentIntegration && newIntegration) {
        const currentAccessObject = JSON.parse(currentIntegration.accessJson);
        const newAccessObject = newIntegration.accessJson;
        return currentAccessObject.refresh_token !== newAccessObject.refresh_token;
    }
    return true;
}

/**
 * Returns status indicating the integration status for Quickbooks
 * @returns { status, integration }
 */
const getQuickbooksIntegrationStatus = async (integration, returnIntegrationObject = false, removeAccessTokens = true) => {
    let status = { status: STATUS.DISCONNECTED };
    if (!integration) {
        integration = await getIntegration(INTEGRATIONS.QUICKBOOKS);
    }
    const accessObject = JSON.parse(integration.accessJson);
    const tokenExpired = isAccessTokenExpired(accessObject, integration.accessUpdated);
    const refreshTokenExpiredResult = isRefreshTokenExpired(accessObject, integration.refreshTokenUpdated);
    if (refreshTokenExpiredResult.expired) { // Needs to reauthenticate
        status.status = STATUS.REFRESH_TOKEN_EXPIRED;
    } else if (tokenExpired && !refreshTokenExpiredResult.expired) {
        status.status = STATUS.ACCESS_TOKEN_EXPIRED;
    } else {
        status.status = STATUS.CONNECTED; // Connected
    }
    status.refreshToken = refreshTokenExpiredResult;
    status.accessToken = { expired: tokenExpired };
    if (removeAccessTokens) {
        // Filter out sensitive fields
        removeProperty(integration, ['accessJson']);
    }
    return { ...status,
        ...returnIntegrationObject && { integration: integration }
    };
}

/**
 * Returns access token or refreshed access token when possible.
 * When integrationObject is not provided, it will get it from the database.
 * Returns null when it indicates that it requires re-authentication.
 * @params {*} integrationObject (optional)
 * @returns {*} accessToken
 */
const getQuickbooksAccessToken = async (integrationObject) => {
    let integration = integrationObject;
    // If not given, it will get it from database
    if (!integration) {
        integration = await getIntegration(INTEGRATIONS.QUICKBOOKS);
    }
    const integrationStatus = await getQuickbooksIntegrationStatus(integration, true, false);
    // Disconnected or refresh token expired, it needs reauthentication
    if (integrationStatus.status === STATUS.DISCONNECTED || integrationStatus.status === STATUS.REFRESH_TOKEN_EXPIRED) {
        return null;
    }
    // Access token expired only, just refresh
    if (integrationStatus.status === STATUS.ACCESS_TOKEN_EXPIRED) {
        if (integration) {
            try {
                const refreshAuth = await refreshToken(JSON.parse(integration.accessJson), integration.realmId);
                if (refreshAuth.json) { // Check it exists
                    try {
                        const result = await saveIntegration({ id: INTEGRATIONS.QUICKBOOKS, accessJson: refreshAuth.json });
                        return result;
                    } catch (error) {
                        log.error('Error saving refreshed access token data to database', error);
                    }
                } else {
                    log.error('Quickbooks refreshToken did not return authentication response with json field');
                }
            } catch (error) {
                log.error('Error refreshing access token, probably the current integration data is no longer valid and requires a re-authentication');
                return null;
            }
        } else {
            log.error('Cannot refresh token without integration data');
        }
    }
    
    if (integrationStatus.status === STATUS.CONNECTED) {
        return integrationStatus.integration;
    }
    return null;
}

/** Disconnects by revoking the tokens */
const revokeQuickbooksToken = async () => {
    const integration = await getQuickbooksAccessToken();
    if (!integration) {
        log.error('There is no Quickbooks integration, it is currently disconnected');
        return { message: 'There is no Quickbooks integration, it is currently disconnected' }
    } else {
        const accessObject = JSON.parse(integration.accessJson);
        return revokeToken(accessObject, integration.realmId)
            .then(result => {
                log.info('Quickbooks token has been revoked, will proceed to delete integration information');
                return deleteIntegration(INTEGRATIONS.QUICKBOOKS)
            })
            .catch(error => {
                // Delete it even it's error, since we are revokint the token anyways
                deleteIntegration(INTEGRATIONS.QUICKBOOKS);
                return { message: 'There is no Quickbooks integration, it is currently disconnected', error }
            });
    }
    
}

module.exports = {
    saveIntegration,
    deleteIntegration,
    getIntegration,
    getQuickbooksIntegrationStatus,
    getQuickbooksAccessToken,
    revokeQuickbooksToken,
    integrationExists,
    INTEGRATIONS
}
