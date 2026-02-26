const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const adminController = require('../controllers/adminController');

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/reports/revenue', adminController.revenue);
router.get('/reports/payments', adminController.payments);

module.exports = router;
