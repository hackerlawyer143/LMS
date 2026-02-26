const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const resultsController = require('../controllers/resultsController');

router.use(authMiddleware);
router.get('/courses/:courseId/results', requireRole('student', 'faculty', 'admin'), resultsController.getByCourse);

module.exports = router;
