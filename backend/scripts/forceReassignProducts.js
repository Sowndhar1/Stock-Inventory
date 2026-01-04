const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  // Get admin user
  const adminUser = await User.findOne({ username: 'admin' });
  
  if (!adminUser) {
    console.log('❌ Admin user not found!');
    mongoose.connection.close();
    return;
  }
  
  console.log(`👤 Admin user: ${adminUser.username} (ID: ${adminUser._id})\n`);
  
  // Count products before
  const totalProducts = await Product.countDocuments();
  const adminProductsBefore = await Product.countDocuments({ createdBy: adminUser._id });
  
  console.log(`📦 Total products: ${totalProducts}`);
  console.log(`📦 Admin products before: ${adminProductsBefore}\n`);
  
  // Force update ALL products to admin
  console.log(`🔄 Force reassigning ALL products to admin...\n`);
  
  const result = await Product.updateMany(
    {},  // Empty filter = all products
    { $set: { createdBy: adminUser._id } }
  );
  
  console.log(`✅ Matched: ${result.matchedCount} products`);
  console.log(`✅ Modified: ${result.modifiedCount} products\n`);
  
  // Verify after
  const adminProductsAfter = await Product.countDocuments({ createdBy: adminUser._id });
  console.log(`📦 Admin products after: ${adminProductsAfter}\n`);
  
  // Show sample
  const sampleProducts = await Product.find({ createdBy: adminUser._id }).limit(5);
  console.log('📦 Sample products:');
  sampleProducts.forEach(p => {
    console.log(`   - ${p.name} (${p.sku}) - Owner ID: ${p.createdBy}`);
  });
  
  mongoose.connection.close();
  console.log('\n✅ Complete! Login as "admin" to see products.');
})
.catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
