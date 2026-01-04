// check-db.js
const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apparel-tracker');
    console.log('🔍 Connected to database');

    const Product = require('./models/Product');
    const Sale = require('./models/Sale');

    const totalProducts = await Product.countDocuments({});
    console.log('📦 Total products:', totalProducts);

    const lowStockProducts = await Product.countDocuments({ lowStockAlert: true });
    console.log('⚠️ Low stock products:', lowStockProducts);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await Sale.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    console.log('💰 Today sales:', todaySales);

    const allProducts = await Product.find({}).limit(5);
    console.log('📋 Sample products:');
    allProducts.forEach(p => {
      console.log(`  - ${p.name}: qty=${p.quantity}, lowStock=${p.lowStockAlert}, reorder=${p.reorderPoint}`);
    });

    // Check if we need to update low stock alerts
    const productsToUpdate = await Product.updateMany(
      { quantity: { $lte: 10 }, lowStockAlert: { $ne: true } },
      { $set: { lowStockAlert: true } }
    );
    console.log('🔄 Updated low stock alerts:', productsToUpdate.modifiedCount);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
