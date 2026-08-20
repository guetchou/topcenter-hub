const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

function unavailable(res) {
  return res.status(501).json({
    success: false,
    code: 'DEPLOYMENT_INTEGRATION_NOT_CONFIGURED'
  });
}

router.post('/trigger', auth, async (req, res) => {
  logger.warn('Deployment trigger requested but no deployment provider is configured', {
    userId: req.user.id,
    repository: req.body.repository,
    branch: req.body.branch || 'main'
  });
  return unavailable(res);
});

router.get('/status/:id', auth, async (req, res) => {
  logger.warn('Deployment status requested but no deployment provider is configured', {
    userId: req.user.id,
    deploymentId: req.params.id
  });
  return unavailable(res);
});

router.get('/history', auth, async (req, res) => {
  logger.warn('Deployment history requested but no deployment provider is configured', {
    userId: req.user.id
  });
  return unavailable(res);
});

module.exports = router;
