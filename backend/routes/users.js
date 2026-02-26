const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const usersController = require('../controllers/usersController');

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/', usersController.list);
router.post('/', usersController.createValidators, usersController.create);
router.put('/:id', usersController.update);
router.patch('/:id/status', usersController.updateStatus);
router.delete('/:id', usersController.remove);

module.exports = router;
