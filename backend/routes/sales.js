const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { auth, hasRole } = require('../middleware/auth');

const router = express.Router();

// Get all sales (all authenticated users can view)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    // All users see all sales
    let query = {};
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const sales = await Sale.find(query)
      .populate('soldBy', 'username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Sale.countDocuments(query);
    
    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new sale (sales or admin only)
router.post('/', hasRole(['admin', 'sales']), async (req, res) => {
  try {
    console.log('Received sale data:', req.body);
    
    const { items, customer, paymentMethod, notes, subtotal, tax, total } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }
    
    if (!customer || !customer.name || !customer.name.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    
    // Create new sale
    const sale = new Sale({
      customer: {
        name: customer.name.trim(),
        phone: customer.phone || '',
        email: customer.email || ''
      },
      paymentMethod: paymentMethod || 'Cash',
      notes: notes || '',
      soldBy: req.user._id,
      store: req.user._id,
      subtotal: subtotal || 0,
      tax: tax || 0,
      total: total || 0
    });
    
    // Add items and update stock
    for (const item of items) {
      console.log('Processing item:', item);
      
      if (!item.productId) {
        return res.status(400).json({ error: 'Product ID is required for each item' });
      }
      
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
        });
      }
      
      // Add item to sale
      sale.addItem(product, item.quantity, item.unitPrice, item.discount || 0);
      
      // Update product stock
      await product.updateStock(item.quantity, 'subtract');
      console.log(`Updated stock for ${product.name}: ${product.quantity}`);
    }
    
    // Calculate totals if not provided
    if (!subtotal || !tax || !total) {
      sale.calculateTotals();
    }
    
    await sale.save();
    console.log('Sale saved successfully:', sale._id);
    
    // Populate sale data for response
    await sale.populate('soldBy', 'username');
    
    res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update sale (sales or admin only)
router.put('/:id', hasRole(['admin', 'sales']), async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('soldBy', 'username');
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete sale (admin only)
router.delete('/:id', hasRole(['admin']), async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    // Restore stock quantities
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.updateStock(item.quantity, 'add');
      }
    }
    
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sales statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const totalSales = await Sale.countDocuments(dateFilter);
    const totalRevenue = await Sale.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const todaySales = await Sale.countDocuments({
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });
    
    const todayRevenue = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    res.json({
      totalSales: totalSales || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      todaySales: todaySales || 0,
      todayRevenue: todayRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 