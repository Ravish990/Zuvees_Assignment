const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, checkRole } = require('../middleware/auth');

// User routes
router.post('/', verifyToken, orderController.createOrder);
router.get('/:id', verifyToken, orderController.getOrderById);

// Admin routes
router.get('/', verifyToken, checkRole(['admin']), orderController.getAllOrders);
router.put('/:id', verifyToken, checkRole(['admin']), orderController.updateOrderStatus);

// Rider routes
router.get('/rider/me', verifyToken, checkRole(['rider']), orderController.getRiderOrders);

module.exports = router;
