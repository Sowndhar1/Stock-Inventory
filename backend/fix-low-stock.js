// fix-low-stock.js
const mongoose = require('mongoose');
require('dotenv').config();

async function fixLowStockAlerts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apparel-tracker');
    console.log('🔍 Connected to database');

    const Product = require('./models/Product');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Total products: ${products.length}`);

    // Check current lowStockAlert status
    const productsWithLowStockAlert = await Product.find({ lowStockAlert: true });
    console.log(`⚠️ Products with lowStockAlert: true: ${productsWithLowStockAlert.length}`);

    // Check products that should have lowStockAlert but don't
    const shouldBeLowStock = products.filter(p => p.quantity <= p.reorderPoint && !p.lowStockAlert);
    console.log(`❌ Products that should be low stock but aren't: ${shouldBeLowStock.length}`);

    // Check products that have lowStockAlert but shouldn't
    const falseLowStock = products.filter(p => p.quantity > p.reorderPoint && p.lowStockAlert);
    console.log(`❌ Products that are falsely marked as low stock: ${falseLowStock.length}`);

    if (shouldBeLowStock.length > 0) {
      console.log('\n🔧 Fixing products that should be low stock:');
      for (const product of shouldBeLowStock) {
        console.log(`  - ${product.name}: qty=${product.quantity}, reorder=${product.reorderPoint}`);
        await Product.updateOne({ _id: product._id }, { lowStockAlert: true });
      }
    }

    if (falseLowStock.length > 0) {
      console.log('\n🔧 Fixing products that are falsely marked as low stock:');
      for (const product of falseLowStock) {
        console.log(`  - ${product.name}: qty=${product.quantity}, reorder=${product.reorderPoint}`);
        await Product.updateOne({ _id: product._id }, { lowStockAlert: false });
      }
    }

    // Recount after fixes
    const finalLowStockCount = await Product.countDocuments({ lowStockAlert: true });
    console.log(`✅ Final low stock count: ${finalLowStockCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixLowStockAlerts();
