// const User = require('../models/User');
// const Product = require('../models/Product');
// const Order = require('../models/Order');
// const ApprovedEmail = require('../models/ApprovedEmail');

// // Get all users (admin only)
// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find();
    
//     res.status(200).json({
//       success: true,
//       count: users.length,
//       data: users
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete user (admin only) 
// exports.deleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
    
//     if (!user) {
//       return res.status(404).json({ message: `User not found with id ${req.params.id}` });
//     }
    
//     await user.remove();
    
//     res.status(200).json({
//       success: true,
//       data: {}
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get all orders (admin only)
// exports.getOrders = async (req, res) => {
//   try {
//     const orders = await Order.find().populate('user', 'id name');
    
//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       data: orders
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Add approved email (admin only)
// exports.addApprovedEmail = async (req, res) => {
//   try {
//     const { email } = req.body;
    
//     // Check if email already exists
//     const exists = await ApprovedEmail.findOne({ email });
//     if (exists) {
//       return res.status(400).json({ message: 'Email already approved' });
//     }
    
//     const approvedEmail = await ApprovedEmail.create({ email });
    
//     res.status(201).json({
//       success: true,
//       data: approvedEmail
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Remove approved email (admin only)
// exports.removeApprovedEmail = async (req, res) => {
//   try {
//     const approvedEmail = await ApprovedEmail.findById(req.params.id);
    
//     if (!approvedEmail) {
//       return res.status(404).json({ message: `Approved email not found with id ${req.params.id}` });
//     }
    
//     await approvedEmail.remove();
    
//     res.status(200).json({
//       success: true,
//       data: {}
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get dashboard stats (admin only)
// exports.getDashboardStats = async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();
//     const productCount = await Product.countDocuments();
//     const orderCount = await Order.countDocuments();
    
//     // Calculate total sales
//     const orders = await Order.find({ isPaid: true });
//     const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    
//     res.status(200).json({
//       success: true,
//       data: {
//         userCount,
//         productCount,
//         orderCount,
//         totalSales
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };