const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
    try {
        const order = new Order({
            ...req.body,
            customer: req.user._id
        });
        
        // Validate and update product stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ message: `Product ${item.product} not found` });
            }
            
            const variant = product.variants.find(
                v => v.size === item.size && v.color === item.color
            );
            
            if (!variant || variant.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for product ${product.name}`
                });
            }
            
            variant.stock -= item.quantity;
            await product.save();
        }
        
        const savedOrder = await order.save();
        await savedOrder.populate('customer items.product');
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        let query = {};
        
        // Filter orders based on user role
        if (req.user.role === 'customer') {
            query.customer = req.user._id;
        } else if (req.user.role === 'rider') {
            query.rider = req.user._id;
        }
        
        const orders = await Order.find(query)
            .populate('customer')
            .populate('items.product')
            .populate('rider');
            
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer')
            .populate('items.product')
            .populate('rider');
            
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if user has access to this order
        if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        if (req.user.role === 'rider' && order.rider._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, riderId } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Validate status transitions
        if (req.user.role === 'admin') {
            if (order.status !== 'paid' && status === 'shipped') {
                return res.status(400).json({ 
                    message: 'Order must be paid before shipping' 
                });
            }
            
            if (status === 'shipped' && !riderId) {
                return res.status(400).json({ 
                    message: 'Rider must be assigned for shipping' 
                });
            }
            
            order.rider = riderId;
        } else if (req.user.role === 'rider') {
            if (order.rider.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied' });
            }
            
            if (order.status !== 'shipped' || 
                !['delivered', 'undelivered'].includes(status)) {
                return res.status(400).json({ 
                    message: 'Invalid status transition' 
                });
            }
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        order.status = status;
        const updatedOrder = await order.save();
        await updatedOrder.populate('customer items.product rider');
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};