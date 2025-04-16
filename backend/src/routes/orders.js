const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const rider = require('../middleware/rider');

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      customer: req.user.id
    });
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/all', [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('rider', 'name email')
      .populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customer's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('items.product')
      .populate('rider', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rider's assigned orders
router.get('/rider-orders', [auth, rider], async (req, res) => {
  try {
    const orders = await Order.find({ 
      rider: req.user.id,
      status: { $in: ['SHIPPED', 'DELIVERED', 'UNDELIVERED'] }
    })
      .populate('customer', 'name email phone address')
      .populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin)
router.patch('/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status, riderId } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'SHIPPED' && !riderId) {
      return res.status(400).json({ message: 'Rider must be assigned for shipping' });
    }

    order.status = status;
    if (riderId) {
      order.rider = riderId;
    }
    order.updatedAt = Date.now();
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status (rider)
router.patch('/:id/delivery-status', [auth, rider], async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      rider: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!['DELIVERED', 'UNDELIVERED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;