const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const coursesController = require('../controllers/coursesController');

router.get('/', coursesController.list);
router.get('/:id', coursesController.getById);

router.use(authMiddleware);

router.post('/', requireRole('faculty', 'admin'), coursesController.createValidators, coursesController.create);
router.put('/:id', requireRole('faculty', 'admin'), coursesController.updateValidators, coursesController.update);
router.delete('/:id', requireRole('admin'), coursesController.remove);

module.exports = router;
