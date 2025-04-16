const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all orders (admin only)
router.get('/orders', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'displayName email')
      .populate('rider', 'displayName email')
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.put('/orders/:id/status', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { status, riderId } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If status is being changed to shipped, a rider must be assigned
    if (status === 'shipped' && !riderId) {
      return res.status(400).json({ message: 'Rider must be assigned for shipped status' });
    }
    
    if (riderId) {
      // Verify rider exists and has rider role
      const rider = await User.findOne({ _id: riderId, role: 'rider' });
      
      if (!rider) {
        return res.status(404).json({ message: 'Rider not found' });
      }
      
      order.rider = riderId;
    }
    
    order.status = status;
    order.updatedAt = Date.now();
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all riders (admin only)
router.get('/riders', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const riders = await User.find({ role: 'rider' }).select('-__v');
    res.json(riders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order counts by status (admin only)
router.get('/dashboard/orders-summary', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const orderCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const result = orderCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;