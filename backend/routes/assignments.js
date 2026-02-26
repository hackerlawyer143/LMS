const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const assignmentsController = require('../controllers/assignmentsController');

router.get('/courses/:courseId/assignments', authMiddleware, assignmentsController.listByCourse);
router.post(
  '/courses/:courseId/assignments',
  authMiddleware,
  requireRole('faculty', 'admin'),
  assignmentsController.createValidators,
  assignmentsController.create
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('faculty', 'admin'),
  assignmentsController.updateValidators,
  assignmentsController.update
);
router.delete('/:id', authMiddleware, requireRole('faculty', 'admin'), assignmentsController.remove);

router.post(
  '/:id/submit',
  authMiddleware,
  requireRole('student'),
  assignmentsController.uploadMiddleware,
  assignmentsController.submit
);

router.get(
  '/:id/submissions',
  authMiddleware,
  requireRole('faculty', 'admin'),
  assignmentsController.listSubmissions
);
router.patch(
  '/:id/submissions/:submissionId/marks',
  authMiddleware,
  requireRole('faculty', 'admin'),
  assignmentsController.updateMarksValidators,
  assignmentsController.updateMarks
);

module.exports = router;
