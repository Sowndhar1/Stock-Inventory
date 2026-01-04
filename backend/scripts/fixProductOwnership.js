const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  // Find products without valid createdBy
  const orphanProducts = await Product.find({
    $or: [
      { createdBy: { $exists: false } },
      { createdBy: null }
    ]
  });
  
  console.log(`📦 Found ${orphanProducts.length} products without owner\n`);
  
  if (orphanProducts.length === 0) {
    console.log('✅ All products have owners!');
    mongoose.connection.close();
    return;
  }
  
  // Get the admin user to assign ownership
  const adminUser = await User.findOne({ username: 'admin' });
  
  if (!adminUser) {
    console.log('❌ No admin user found. Cannot assign ownership.');
    mongoose.connection.close();
    return;
  }
  
  console.log(`👤 Assigning all orphan products to: ${adminUser.username} (${adminUser.email})\n`);
  
  // Update all orphan products
  const result = await Product.updateMany(
    {
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null }
      ]
    },
    {
      $set: { createdBy: adminUser._id }
    }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} products`);
  
  // Verify
  const adminProducts = await Product.countDocuments({ createdBy: adminUser._id });
  console.log(`✅ Admin now has ${adminProducts} products\n`);
  
  // Show sample products
  const sampleProducts = await Product.find({ createdBy: adminUser._id }).limit(5);
  console.log('📦 Sample products now owned by admin:');
  sampleProducts.forEach(p => {
    console.log(`   - ${p.name} (${p.sku})`);
  });
  
  mongoose.connection.close();
  console.log('\n✅ Fix complete! Please refresh your frontend.');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
