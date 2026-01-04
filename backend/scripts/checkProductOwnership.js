const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  const users = await User.find();
  
  console.log('📊 Products by User:\n');
  
  for (const user of users) {
    const productCount = await Product.countDocuments({ createdBy: user._id });
    console.log(`👤 ${user.username} (${user.email}): ${productCount} products`);
    
    if (productCount > 0) {
      const products = await Product.find({ createdBy: user._id }).limit(3);
      products.forEach(p => {
        console.log(`   - ${p.name} (${p.sku})`);
      });
      if (productCount > 3) {
        console.log(`   ... and ${productCount - 3} more`);
      }
    }
    console.log('');
  }
  
  // Check for products without owner
  const orphanProducts = await Product.countDocuments({ createdBy: { $exists: false } });
  if (orphanProducts > 0) {
    console.log(`⚠️  ${orphanProducts} products without owner found\n`);
  }
  
  mongoose.connection.close();
  console.log('✅ Check complete');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
