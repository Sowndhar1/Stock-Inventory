const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  // Get all products
  const allProducts = await Product.find().limit(5);
  
  console.log('📦 Sample Products with createdBy field:\n');
  for (const product of allProducts) {
    console.log(`Product: ${product.name}`);
    console.log(`  SKU: ${product.sku}`);
    console.log(`  createdBy: ${product.createdBy}`);
    console.log(`  createdBy type: ${typeof product.createdBy}`);
    
    // Try to find the user
    if (product.createdBy) {
      const owner = await User.findById(product.createdBy);
      if (owner) {
        console.log(`  Owner: ${owner.username} (${owner.email})`);
      } else {
        console.log(`  Owner: NOT FOUND (invalid user ID)`);
      }
    }
    console.log('');
  }
  
  // Get all users
  console.log('\n👥 All Users:\n');
  const users = await User.find();
  users.forEach(u => {
    console.log(`  ${u.username} - ID: ${u._id}`);
  });
  
  mongoose.connection.close();
  console.log('\n✅ Debug complete');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
