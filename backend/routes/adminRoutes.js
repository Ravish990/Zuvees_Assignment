const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.use(verifyToken);
router.use(checkRole(['admin']));

// Get user by ID (example)
router.get('/users/:id', userController.getUserById);

module.exports = router;
