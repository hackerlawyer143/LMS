const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const transactionsController = require('../controllers/transactionsController');

router.use(authMiddleware);

router.get('/', requireRole('student', 'admin'), transactionsController.list);
router.get('/:id/receipt', transactionsController.getReceipt);

module.exports = router;
