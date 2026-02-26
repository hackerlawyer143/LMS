const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const quizzesController = require('../controllers/quizzesController');

router.get('/courses/:courseId/quizzes', authMiddleware, quizzesController.listByCourse);
router.get('/:id', authMiddleware, quizzesController.getById);

router.post(
  '/courses/:courseId/quizzes',
  authMiddleware,
  requireRole('faculty', 'admin'),
  quizzesController.createValidators,
  quizzesController.create
);
router.put(
  '/:id',
  authMiddleware,
  requireRole('faculty', 'admin'),
  quizzesController.updateValidators,
  quizzesController.update
);
router.delete('/:id', authMiddleware, requireRole('faculty', 'admin'), quizzesController.remove);

router.post(
  '/:id/attempt',
  authMiddleware,
  requireRole('student'),
  quizzesController.attemptValidators,
  quizzesController.attempt
);

module.exports = router;
