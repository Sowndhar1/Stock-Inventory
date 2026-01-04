const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Jackets', 'Dresses', 'Shoes', 'Accessories']
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  image: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lowStockAlert: {
    type: Boolean,
    default: false
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  reorderPoint: {
    type: Number,
    default: 5
  },
  reorderQuantity: {
    type: Number,
    default: 10
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', sku: 'text', brand: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ quantity: 1 });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.costPrice > 0) {
    return ((this.price - this.costPrice) / this.costPrice * 100).toFixed(2);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.quantity <= 2) return 'critical';
  if (this.quantity <= this.reorderPoint) return 'low';
  return 'in-stock';
});

// Method to check if stock is low
productSchema.methods.isLowStock = function() {
  return this.quantity <= this.reorderPoint;
};

// Method to update stock
productSchema.methods.updateStock = async function(quantity, operation = 'add') {
  try {
    console.log(`Updating stock for ${this.name}: ${this.quantity} ${operation} ${quantity}`);
    
    if (operation === 'add') {
      this.quantity += quantity;
    } else if (operation === 'subtract') {
      const newQuantity = this.quantity - quantity;
      if (newQuantity < 0) {
        throw new Error(`Insufficient stock for ${this.name}. Available: ${this.quantity}, Requested: ${quantity}`);
      }
      this.quantity = newQuantity;
    }
    
    console.log(`New stock for ${this.name}: ${this.quantity}`);
    
    // Update low stock alert
    this.lowStockAlert = this.quantity <= this.reorderPoint;
    
    return await this.save();
  } catch (error) {
    console.error(`Error updating stock for ${this.name}:`, error);
    throw error;
  }
};

// Pre-save middleware to check low stock
productSchema.pre('save', function(next) {
  this.lowStockAlert = this.quantity <= this.reorderPoint;
  next();
});

module.exports = mongoose.model('Product', productSchema); 