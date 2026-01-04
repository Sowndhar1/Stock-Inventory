const express = require('express');
const Product = require('../models/Product');
const { auth, inventoryAuth, hasRole } = require('../middleware/auth');

const router = express.Router();

// Get all products (all authenticated users can view)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, brand } = req.query;
    
    // Build query - no user filtering, all users see all products
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by brand
    if (brand) {
      query.brand = brand;
    }
    
    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock products only (must come before /:id route)
router.get('/low-stock', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, brand, search } = req.query;

    // Build filter for low stock products - simplified for debugging
    let filter = { lowStockAlert: true };

    // Add optional filters
    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    console.log('Low stock filter:', JSON.stringify(filter, null, 2));

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate('createdBy', 'username')
      .limit(limit * 1)
      .skip(skip)
      .sort({ quantity: 1, name: 1 }); // Sort by quantity ascending, then name

    const total = await Product.countDocuments(filter);

    // Calculate stock status for each product
    const productsWithStatus = products.map(product => {
      const stockStatus = {
        status: 'In Stock',
        color: 'success',
        severity: 1
      };

      if (product.quantity === 0) {
        stockStatus.status = 'Out of Stock';
        stockStatus.color = 'error';
        stockStatus.severity = 3;
      } else if (product.quantity <= 2) {
        stockStatus.status = 'Critical';
        stockStatus.color = 'error';
        stockStatus.severity = 3;
      } else if (product.quantity <= product.reorderPoint) {
        stockStatus.status = 'Low Stock';
        stockStatus.color = 'warning';
        stockStatus.severity = 2;
      }

      return {
        ...product.toObject(),
        stockStatus
      };
    });

    res.json({
      products: productsWithStatus,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update stock quantity (inventory or admin only)
router.patch('/:id/stock', hasRole(['admin', 'inventory']), async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await product.updateStock(quantity, operation);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 