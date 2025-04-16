const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get assigned orders (rider only)
router.get('/orders', verifyToken, checkRole(['rider']), async (req, res) => {
  try {
    const { status } = req.query;
    let query = { rider: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'displayName email phoneNumber address')
      .populate('items.product', 'name imageUrl')
      .sort({ updatedAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (rider only)
router.put('/orders/:id/status', verifyToken, checkRole(['rider']), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['delivered', 'undelivered'].includes(status)) {
      return res.status(400).json({ 
        message: 'Valid status (delivered or undelivered) is required' 
      });
    }
    
    const order = await Order.findOne({ 
      _id: req.params.id,
      rider: req.user._id,
      status: 'shipped' // Can only update if current status is shipped
    });
    
    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found or you are not authorized to update it' 
      });
    }
    
    order.status = status;
    order.updatedAt = Date.now();
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get order details (rider only)
router.get('/orders/:id', verifyToken, checkRole(['rider']), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      rider: req.user._id
    })
      .populate('user', 'displayName email phoneNumber address')
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found or you are not authorized to view it' 
      });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;