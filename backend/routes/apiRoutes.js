const express = require('express');
const controller = require('../controllers/apiController');
const authenticate = require('../middleware/auth');

const router = express.Router();
router.post('/auth/login', controller.login);
router.use(authenticate);
router.get('/reports', controller.getReports);
router.get('/reports/:id', controller.getReport);
router.post('/reports/analyze-draft', controller.analyzeDraft);
router.post('/reports', controller.createReport);
router.post('/reports/:id/analyze', controller.analyzeReport);
router.get('/dashboard', controller.getDashboard);
router.get('/analytics', controller.getAnalytics);
router.get('/actions', controller.getActions);
router.put('/actions/:id', controller.updateAction);

module.exports = router;