const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken, checkRole } = require('../middleware/auth');

// Create new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    
    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Calculate total amount and validate product availability
    let totalAmount = 0;
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      
      // Find the specific variant
      const variant = product.variants.find(
        v => v.size === item.variant.size && v.color === item.variant.color
      );
      
      if (!variant) {
        return res.status(404).json({ message: `Variant not found for product: ${product.name}` });
      }
      
      if (variant.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name} (${item.variant.color}, ${item.variant.size})`
        });
      }
      
      // Update the price from the variant
      item.price = variant.price;
      totalAmount += variant.price * item.quantity;
      
      // Update stock
      variant.stock -= item.quantity;
    }
    
    await Product.bulkWrite(
      items.map(item => ({
        updateOne: {
          filter: {
            _id: item.product,
            'variants.size': item.variant.size,
            'variants.color': item.variant.color
          },
          update: {
            $inc: { 'variants.$.stock': -item.quantity }
          }
        }
      }))
    );
    
    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: 'paid' // Assuming payment is successful for simplicity
    });
    
    const savedOrder = await order.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's orders
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .populate('rider', 'displayName email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'displayName email')
      .populate('rider', 'displayName email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user has permission to view this order
    if (
      req.user.role === 'customer' && 
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    // Rider can only view assigned orders
    if (
      req.user.role === 'rider' && 
      (!order.rider || order.rider._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;