const Order = require('../models/Order');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { products, shippingAddress } = req.body;
    const totalAmount = products.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    const order = new Order({
      user: req.user._id,
      products,
      totalAmount,
      shippingAddress,
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'displayName email').populate('products.product', 'name price');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders for admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'displayName email').populate('products.product', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status by admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, rider } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status, rider }, { new: true }).populate('user', 'displayName email').populate('products.product', 'name price');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get orders assigned to a specific rider
exports.getRiderOrders = async (req, res) => {
    try {
        const riderId = req.user._id;
        const orders = await Order.find({ rider: riderId }).populate('user', 'displayName email').populate('products.product', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
