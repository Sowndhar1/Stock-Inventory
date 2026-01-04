const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  }
});

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  customer: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Credit'],
    default: 'Cash'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Partial'],
    default: 'Paid'
  },
  status: {
    type: String,
    enum: ['Completed', 'Cancelled', 'Refunded'],
    default: 'Completed'
  },
  notes: {
    type: String,
    trim: true
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
saleSchema.index({ createdAt: -1 });
saleSchema.index({ invoiceNumber: 1 });
saleSchema.index({ 'customer.name': 1 });
saleSchema.index({ soldBy: 1 });

// Virtual for profit calculation
saleSchema.virtual('profit').get(function() {
  let totalProfit = 0;
  this.items.forEach(item => {
    // This would need cost price from product, simplified for now
    totalProfit += item.totalPrice - item.discount;
  });
  return totalProfit;
});

// Method to generate invoice number
saleSchema.statics.generateInvoiceNumber = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `INV-${year}${month}${day}-${timestamp}`;
};

// Pre-save middleware to generate invoice number
saleSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = this.constructor.generateInvoiceNumber();
  }
  next();
});

// Method to calculate totals
saleSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.total = this.subtotal + this.tax - this.discount;
  return this;
};

// Method to add item
saleSchema.methods.addItem = function(product, quantity, unitPrice, discount = 0) {
  const totalPrice = quantity * unitPrice;
  this.items.push({
    product: product._id,
    productName: product.name,
    sku: product.sku,
    category: product.category,
    quantity,
    unitPrice,
    totalPrice,
    discount
  });
  this.calculateTotals();
  return this;
};

// Method to remove item
saleSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  this.calculateTotals();
  return this;
};

module.exports = mongoose.model('Sale', saleSchema); 