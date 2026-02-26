const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const authController = require('../controllers/authController');

router.post(
  '/register',
  authController.registerValidators,
  authController.register
);

router.post(
  '/login',
  authController.loginValidators,
  authController.login
);

router.get('/me', authMiddleware, authController.me);

module.exports = router;
