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
  
  console.log(`👤 Admin user found: ${adminUser.username} (ID: ${adminUser._id})\n`);
  
  // Find all products with invalid createdBy
  const allProducts = await Product.find();
  let invalidCount = 0;
  
  for (const product of allProducts) {
    if (product.createdBy) {
      const owner = await User.findById(product.createdBy);
      if (!owner) {
        invalidCount++;
      }
    }
  }
  
  console.log(`📦 Found ${invalidCount} products with invalid owner\n`);
  
  if (invalidCount === 0) {
    console.log('✅ All products have valid owners!');
    mongoose.connection.close();
    return;
  }
  
  // Update all products to admin
  console.log(`🔄 Reassigning all ${allProducts.length} products to admin...\n`);
  
  const result = await Product.updateMany(
    {},
    { $set: { createdBy: adminUser._id } }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} products`);
  
  // Verify
  const adminProducts = await Product.countDocuments({ createdBy: adminUser._id });
  console.log(`✅ Admin now has ${adminProducts} products\n`);
  
  // Show sample
  const sampleProducts = await Product.find({ createdBy: adminUser._id }).limit(5);
  console.log('📦 Sample products now owned by admin:');
  sampleProducts.forEach(p => {
    console.log(`   - ${p.name} (${p.sku})`);
  });
  
  mongoose.connection.close();
  console.log('\n✅ Fix complete! Now login as "admin" to see all products.');
})
.catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
