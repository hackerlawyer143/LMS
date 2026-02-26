const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const enrollmentsController = require('../controllers/enrollmentsController');

router.use(authMiddleware);
router.use(requireRole('student'));

router.get('/my', enrollmentsController.myEnrollments);
router.post('/', enrollmentsController.enroll);

module.exports = router;
