const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const paymentsController = require('../controllers/paymentsController');

router.post('/create-order', authMiddleware, requireRole('student'), paymentsController.createOrder);
router.post('/verify', authMiddleware, requireRole('student'), paymentsController.verifyValidators, paymentsController.verify);
module.exports = router;
