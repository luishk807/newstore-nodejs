const router = require('express').Router();
const { authorizeUri, parseRedirect } = require('../../../integrations/quickbooks/auth');
const cors = require('cors');
const { checkCorsOrigins } = require('../../../utils/server');
const { saveIntegration, getQuickbooksIntegrationStatus, revokeQuickbooksToken, INTEGRATIONS } = require('../../../services/integration.service');
const verifyAdmin = require('../../../middlewares/verifyTokenAdmin');
const { integrations } = require('../../../config');
const hmacSHA256 = require('crypto-js/hmac-sha256');
const base64 = require('crypto-js/enc-base64');
const corsOption = {
    origin: checkCorsOrigins
}
const log = global.logger;
  
router.all('*', cors(corsOption));

const middlewares = [verifyAdmin];

/** Returns the Quickbooks authentication uri */
router.get('/auth/uri', middlewares, (req, res) => {
    res.status(200).json({ url: authorizeUri });
});

/** Integration callback from Quickbooks */
router.get('/callback', async (req, res) => {
    const accessTokens = await parseRedirect(req.url);
    // Save the access token information to database
    try {
        await saveIntegration({ id: INTEGRATIONS.QUICKBOOKS, realmId: req.query.realmId, accessJson: accessTokens.json });
        // Sends a script that posts a message back to the window opener so it can close it
        res.status(200).send(`<script type="application/javascript">window.opener.postMessage({ status: 1 }, '*')</script>`);
    } catch (error) {
        log.error('Error saving integration data to database', error);
        // Sends a script that posts a message back to the window opener so it can close it
        res.status(200).send(`<script type="application/javascript">window.opener.postMessage({ status: 0 }, '*')</script>`);
    }
    
});

/** Returns status of Quickbooks application connection */
router.get('/auth/status', middlewares, (req, res) => {
    getQuickbooksIntegrationStatus(null, true).
        then(result => {
            res.status(200).json(result);
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

router.get('/auth/disconnect', middlewares, (req, res) => {
    revokeQuickbooksToken()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

router.post('/webhooks', (req, res) => {
    const webhookPayload = JSON.stringify(req.body);
    const signature = req.get('intuit-signature');

    // if signature is empty return 401
    if (!signature) {
        return res.status(401).send('Unauthorized');
    }

    // if payload is empty, don't do anything
    if (!webhookPayload) {
        return res.status(200).send('success');
    }

    /**
     * Validates the payload with the intuit-signature hash
     */
    const hash = base64.stringify(hmacSHA256(webhookPayload, integrations.quickbooks.webhookToken));

    if (signature === hash) {
        logger.webhook(`Webhook notification payload: ${webhookPayload}`);

        const events = req.body.eventNotifications;

        for(let i=0; i < events.length; i++) {
            var entities = events[i].dataChangeEvent.entities;
            var realmID = events[i].realmId;
            for(var j=0; j < entities.length; j++) {
                var notification = {
                    'realmId': realmID,
                    'name': entities[i].name,
                    'id': entities[i].id,
                    'operation': entities[i].operation,
                    'lastUpdated': entities[i].lastUpdated
                }
            }
        }
    }
    res.status(200).send('success');
})

module.exports = router;
